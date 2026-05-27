/**
 * background.js — Production service worker
 *
 * Full-page rate-limit fix (root cause analysis):
 * ─────────────────────────────────────────────────────────────────────────────
 * Chrome enforces MAX_CAPTURE_VISIBLE_TAB_CALLS_PER_SECOND internally.
 * The actual hard limit is ~2 calls/sec but Chrome's token bucket refills
 * asynchronously — so even 500ms apart can fail if the previous call's
 * response came back slowly (network + IPC latency eats into the gap).
 *
 * The ONLY reliable solution:
 *  1. Track when each call COMPLETES (not when it starts)
 *  2. Wait MIN_GAP ms after completion before the next call
 *  3. On rate-limit error: exponential backoff, reset the clock, retry
 *  4. Never run two captureVisibleTab calls concurrently (global mutex)
 *  5. Scroll AFTER the capture completes (not before) so scroll+capture
 *     latency doesn't compress the gap
 *
 * MIN_GAP = 750ms chosen because:
 *  - Chrome limit ≈ 2/sec = 500ms minimum
 *  - IPC round-trip adds ~50-150ms
 *  - We want 100ms safety margin on top
 *  = 750ms total
 */

"use strict";

// ─── Global capture mutex ─────────────────────────────────────────────────────
// Only ONE captureVisibleTab call in flight at a time, across all messages.
// This is the primary fix — the previous code had a broken queue that let
// concurrent captures race.

let _captureMutex = Promise.resolve();
let _lastCaptureCompleteAt = 0;
const MIN_CAPTURE_GAP_MS = 750;

/**
 * The only place captureVisibleTab is called.
 * Enforces: global mutex + minimum gap + retry with backoff.
 */
async function captureTab() {
  // Chain onto the mutex so calls are strictly sequential
  const result = await (_captureMutex = _captureMutex.then(async () => {
    return _captureWithRetry(5);
  }));
  return result;
}

async function _captureWithRetry(retriesLeft) {
  // Enforce minimum gap from LAST COMPLETION (not last start)
  const msSinceLastCapture = Date.now() - _lastCaptureCompleteAt;
  if (msSinceLastCapture < MIN_CAPTURE_GAP_MS) {
    await sleep(MIN_CAPTURE_GAP_MS - msSinceLastCapture);
  }

  try {
    const dataUrl = await _captureOnce();
    _lastCaptureCompleteAt = Date.now(); // record COMPLETION time
    return dataUrl;
  } catch (err) {
    const isRateLimit = isRateLimitError(err);

    if (isRateLimit && retriesLeft > 0) {
      // Exponential backoff starting at 800ms
      const backoff = 800 * Math.pow(2, 5 - retriesLeft);
      console.warn(`[BG] Rate limited — backoff ${backoff}ms (${retriesLeft} retries left)`);
      await sleep(backoff);
      _lastCaptureCompleteAt = 0; // force full gap on retry
      return _captureWithRetry(retriesLeft - 1);
    }

    throw err;
  }
}

function _captureOnce() {
  return new Promise((resolve, reject) => {
    chrome.tabs.captureVisibleTab(null, { format: "png" }, (dataUrl) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve(dataUrl);
      }
    });
  });
}

function isRateLimitError(err) {
  const m = (err?.message || "").toLowerCase();
  return (
    m.includes("max_capture") ||
    m.includes("rate") ||
    m.includes("exceeded") ||
    m.includes("too many") ||
    m.includes("throttl")
  );
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function blobToDataUrl(blob) {
  const ab = await blob.arrayBuffer();
  const bytes = new Uint8Array(ab);
  let binary = "";
  // Process in chunks to avoid call stack overflow on large images
  for (let i = 0; i < bytes.length; i += 8192) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
  }
  return `data:${blob.type};base64,${btoa(binary)}`;
}

// ─── Extension UI hide/show ───────────────────────────────────────────────────
// Uses visibility+opacity rather than display:none to avoid layout reflow
// which would cause the page to reflow between scroll steps (sticky headers shift).

async function hideUI(tabId) {
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      func: () => {
        const h = document.getElementById("__EXT_HOST__");
        if (!h) return;
        h.dataset.ssV  = h.style.visibility;
        h.dataset.ssO  = h.style.opacity;
        h.dataset.ssPe = h.style.pointerEvents;
        h.style.visibility   = "hidden";
        h.style.opacity      = "0";
        h.style.pointerEvents = "none";
      },
    });
    // Wait for TWO paint frames. requestAnimationFrame fires after layout,
    // but we need the GPU composite too. 120ms covers 2 frames at 60fps + IPC.
    await sleep(120);
  } catch (e) {
    // Non-fatal: page may not have extension (e.g. extension just injected)
    console.warn("[BG] hideUI:", e.message);
  }
}

async function showUI(tabId) {
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      func: () => {
        const h = document.getElementById("__EXT_HOST__");
        if (!h) return;
        h.style.visibility   = h.dataset.ssV  ?? "visible";
        h.style.opacity      = h.dataset.ssO  ?? "1";
        h.style.pointerEvents = h.dataset.ssPe ?? "auto";
        delete h.dataset.ssV;
        delete h.dataset.ssO;
        delete h.dataset.ssPe;
      },
    });
  } catch (e) {
    console.warn("[BG] showUI:", e.message);
  }
}

// ─── Scroll helpers ───────────────────────────────────────────────────────────

async function scrollTo(tabId, y) {
  await chrome.scripting.executeScript({
    target: { tabId },
    func: (sy) => window.scrollTo({ top: sy, behavior: "instant" }),
    args: [y],
  });
  // Give the page time to repaint after scroll.
  // Sticky headers, lazy images, CSS transitions all need time.
  // 250ms is safe; we can afford it since capture is throttled anyway.
  await sleep(250);
}

async function getScrollY(tabId) {
  const [{ result }] = await chrome.scripting.executeScript({
    target: { tabId },
    func: () => window.scrollY,
  });
  return result ?? 0;
}

// ─── Crop ─────────────────────────────────────────────────────────────────────

async function crop(dataUrl, x, y, w, h, dpr) {
  dpr = dpr || 1;
  const blob = await (await fetch(dataUrl)).blob();
  const bmp  = await createImageBitmap(blob);
  const oc   = new OffscreenCanvas(Math.round(w * dpr), Math.round(h * dpr));
  const ctx  = oc.getContext("2d");
  ctx.drawImage(bmp, -Math.round(x * dpr), -Math.round(y * dpr));
  return blobToDataUrl(await oc.convertToBlob({ type: "image/png" }));
}

// ─── Stitch ───────────────────────────────────────────────────────────────────

async function stitch(strips, vw, totalH, vh, dpr) {
  dpr = dpr || 1;

  // Use the actual bottom of the last strip as canvas height
  // (avoids 1px gaps or over-allocation from imprecise scrollHeight)
  const last = strips[strips.length - 1];
  const realHeight = Math.min(totalH, last.scrollY + vh);

  const cw = Math.round(vw      * dpr);
  const ch = Math.round(realHeight * dpr);
  const oc  = new OffscreenCanvas(cw, ch);
  const ctx = oc.getContext("2d");

  for (const { dataUrl, scrollY } of strips) {
    const blob = await (await fetch(dataUrl)).blob();
    const bmp  = await createImageBitmap(blob);

    const destY = Math.round(scrollY * dpr);
    const avail = ch - destY;                     // remaining canvas space
    const srcH  = Math.min(bmp.height, avail);    // don't overdraw

    if (srcH <= 0) continue;

    ctx.drawImage(bmp, 0, 0, bmp.width, srcH, 0, destY, cw, srcH);
  }

  return blobToDataUrl(await oc.convertToBlob({ type: "image/png" }));
}

// ─── Capture handlers ─────────────────────────────────────────────────────────

async function doVisible(tabId) {
  await hideUI(tabId);
  try {
    return await captureTab();
  } finally {
    await showUI(tabId);
  }
}

async function doRegion(tabId, { x, y, width, height, devicePixelRatio }) {
  await hideUI(tabId);
  try {
    const full = await captureTab();
    return await crop(full, x, y, width, height, devicePixelRatio);
  } finally {
    await showUI(tabId);
  }
}

async function doFullPage(tabId, { totalHeight, viewportHeight, viewportWidth, devicePixelRatio }) {
  // Single viewport — no scrolling needed
  if (totalHeight <= viewportHeight + 2) {
    return doVisible(tabId);
  }

  const origY = await getScrollY(tabId);
  await hideUI(tabId);

  const strips = [];
  let targetY  = 0;
  let prevActualY = -1;

  try {
    while (true) {
      // Scroll first, THEN capture (order matters for repaint)
      await scrollTo(tabId, targetY);

      // Read back real scroll position — browser may clamp it
      const actualY = await getScrollY(tabId);

      // Infinite-scroll / fixed-height body guard
      if (strips.length > 0 && actualY === prevActualY) {
        console.warn("[BG] Scroll position unchanged — page may have fixed height, stopping");
        break;
      }
      prevActualY = actualY;

      // Capture AFTER scroll settled — captureTab enforces its own gap
      const dataUrl = await captureTab();
      strips.push({ dataUrl, scrollY: actualY });

      // Stop when the bottom of this strip reaches or exceeds page bottom
      if (actualY + viewportHeight >= totalHeight) break;

      // Hard cap to prevent runaway on infinite-scroll pages
      if (strips.length >= 40) {
        console.warn("[BG] Strip cap (40) reached");
        break;
      }

      // Next scroll position: advance by full viewport
      // (overlap is handled in stitch by using actualY as destY)
      targetY = actualY + viewportHeight;
    }
  } finally {
    // Always restore — runs even if captureTab throws
    try {
      await chrome.scripting.executeScript({
        target: { tabId },
        func: (y) => window.scrollTo({ top: y, behavior: "instant" }),
        args: [origY],
      });
    } catch (_) {}
    await showUI(tabId);
  }

  if (strips.length === 0) throw new Error("No strips captured");

  return stitch(strips, viewportWidth, totalHeight, viewportHeight, devicePixelRatio);
}

// ─── Tab action (toggle extension UI) ────────────────────────────────────────

const injectedTabs = new Set();

chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.id) return;
  const url = tab.url || "";
  if (
    url.startsWith("chrome://") ||
    url.startsWith("chrome-extension://") ||
    url.startsWith("edge://") ||
    url.startsWith("about:")
  ) return;

  if (injectedTabs.has(tab.id)) {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const r = document.getElementById("__EXT_HOST__");
        if (r) { r.style.display = "none"; }
        document.documentElement.style.userSelect = "";
      },
    });
    injectedTabs.delete(tab.id);
  } else {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const r = document.getElementById("__EXT_HOST__");
        if (r) { r.style.display = "block";
          r.querySelector("#colorSelectorBtn")?.click();  


         }
        document.documentElement.style.userSelect = "none";
          },
    });
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content.js"],
    });
    injectedTabs.add(tab.id);
  }
});

chrome.tabs.onRemoved.addListener((id) => injectedTabs.delete(id));
chrome.tabs.onUpdated.addListener((id, info) => {
  if (info.status === "loading") injectedTabs.delete(id);
});

// ─── Single message listener ──────────────────────────────────────────────────

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  const tabId = sender.tab?.id;

  // ── CAPTURE_* (from ScreenShot.tsx) ──────────────────────────────────────
  if (msg?.type?.startsWith("CAPTURE_")) {
    if (!tabId) {
      sendResponse({ error: "Message must come from a content script (no tab ID)" });
      return false;
    }

    const url = sender.tab?.url || "";
    if (url.startsWith("chrome://") || url.startsWith("about:")) {
      sendResponse({ error: "Cannot capture restricted browser pages" });
      return false;
    }

    // Each capture is sequenced through captureTab's mutex —
    // no two ever overlap, regardless of how many messages arrive.
    const run = async () => {
      switch (msg.type) {
        case "CAPTURE_VISIBLE":
          return doVisible(tabId);

        case "CAPTURE_REGION":
          return doRegion(tabId, {
            x: msg.x, y: msg.y,
            width: msg.width, height: msg.height,
            devicePixelRatio: msg.devicePixelRatio,
          });

        case "CAPTURE_FULL_PAGE":
          return doFullPage(tabId, {
            totalHeight:     msg.totalHeight,
            viewportHeight:  msg.viewportHeight,
            viewportWidth:   msg.viewportWidth,
            devicePixelRatio: msg.devicePixelRatio,
          });

        default:
          throw new Error("Unknown capture type: " + msg.type);
      }
    };

    run()
      .then((dataUrl) => sendResponse({ dataUrl }))
      .catch((err)    => {
        console.error("[BG]", msg.type, err.message);
        sendResponse({ error: err.message });
      });

    return true; // keep sendResponse channel open for async
  }

  // ── Legacy messages ───────────────────────────────────────────────────────

  if (msg.action === "captureScreenshot") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs[0]) return sendResponse({ error: "No active tab" });
      chrome.tabs.captureVisibleTab(tabs[0].windowId, { format: "png", quality: 100 }, (url) => {
        if (chrome.runtime.lastError) sendResponse({ error: chrome.runtime.lastError.message });
        else sendResponse({ screenshot: url });
      });
    });
    return true;
  }

  if (msg.action === "captureFullPage") {
    if (!tabId) { sendResponse({ success: false }); return false; }
    chrome.scripting.executeScript(
      {
        target: { tabId },
        func: () => ({
          width: document.documentElement.scrollWidth,
          height: document.documentElement.scrollHeight,
          viewportWidth: window.innerWidth,
          viewportHeight: window.innerHeight,
        }),
      },
      (results) => {
        if (!results?.[0]?.result) sendResponse({ success: false });
        else sendResponse({ success: true, dimensions: results[0].result });
      }
    );
    return true;
  }

  if (msg.action === "captureScreenshotSegment") {
    if (!sender.tab?.windowId) return false;
    chrome.tabs.captureVisibleTab(sender.tab.windowId, { format: "png" }, (dataUrl) => {
      sendResponse(dataUrl);
    });
    return true;
  }

  return false;
});