import React, { useEffect, useState } from "react";
import { baseURL } from "../UI-Models/Constant";
import { Trash2 } from "lucide-react";
import { baseColor } from "../UI-Models/Constant"; 
type ActivatedDevice = {
  licenseKey: string;
  time: string;
  userAgent: string;
};

const LicenseManagement = () => {
  /* ───────────────────────────────
     THEME (EDIT EVERYTHING HERE)
  ─────────────────────────────── */
  const theme = {
    bg: "#0f0f10",
    card: "#171718",
    soft: "#1d1d1f",
    border: "#2b2b2e",
    text: "#ffffff",
    sub: "#8f8f95",
    green: "#49d17c",
    red: "#ff5e5e",
    accent: "#3B9D55",
    disabled: "#3a3a3f",
  };

  const MAX_DEVICES = 2;

  /* ─────────────────────────────── */
  const [licenseKey, setLicenseKey] = useState("");
  const [activeKey, setActiveKey] = useState<string | null>(null);

  const [deviceId] = useState(
    "Device-" + Math.random().toString(36).slice(2, 7).toUpperCase()
  );

  const [loading, setLoading] = useState<
    "idle" | "activate" | "remove" | "device"
  >("idle");

  const [blockedDevices, setBlockedDevices] = useState<ActivatedDevice[]>([]);

  const [status, setStatus] = useState<{
    type: "idle" | "success" | "error";
    text: string;
  }>({ type: "idle", text: "" });

  const isBusy = loading !== "idle";
  const isOverLimit = blockedDevices.length > MAX_DEVICES;

  /* ───────────────────────────────
     STORAGE SYNC
  ─────────────────────────────── */
  useEffect(() => {
    chrome?.storage?.local.get(["active-license"], (res) => {
      if (res["active-license"]) setActiveKey(res["active-license"]);
    });
  }, []);

  useEffect(() => {
    if (!chrome?.storage?.local) return;

    if (activeKey) {
      chrome.storage.local.set({ "active-license": activeKey });
    } else {
      chrome.storage.local.remove("active-license");
    }
  }, [activeKey]);

  /* ─────────────────────────────── */
  const formatKey = (value: string) =>
    value
      .replace(/[^a-zA-Z0-9]/g, "")
      .toUpperCase()
      .slice(0, 16)
      .match(/.{1,4}/g)
      ?.join("-") || "";

  /* ───────────────────────────────
     ACTIVATE LICENSE
  ─────────────────────────────── */
  const activateLicense = async () => {
    if (!licenseKey.trim()) {
      setStatus({ type: "error", text: "Enter license key." });
      return;
    }

    try {
      setLoading("activate");
      setStatus({ type: "idle", text: "" });

      const res = await fetch(`${baseURL}/activate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ licenseKey, deviceId }),
      });

      const data = await res.json();

      if (res.ok) {
        setActiveKey(licenseKey);
        setStatus({ type: "success", text: "License activated successfully." });
      } else {
        setStatus({ type: "error", text: data.message || "Activation failed." });
        setBlockedDevices(data.activatedDevices || []);
      }
    } catch {
      setStatus({ type: "error", text: "Server error." });
    } finally {
      setLoading("idle");
    }
  };

  /* ───────────────────────────────
     REMOVE LICENSE (LOCAL)
  ─────────────────────────────── */
  const removeLocalLicense = async () => {
    try {
      setLoading("remove");
      setStatus({ type: "idle", text: "" });

      await new Promise((r) => setTimeout(r, 700));

      setActiveKey(null);
      setLicenseKey("");
      setBlockedDevices([]);

      setStatus({ type: "success", text: "License removed from device." });
    } finally {
      setLoading("idle");
    }
  };

  /* ───────────────────────────────
     REMOVE DEVICE SLOT
  ─────────────────────────────── */
  const removeServerSlot = async (time: string) => {
    try {
      setLoading("device");

      const res = await fetch(`${baseURL}/deactivate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ licenseKey, time }),
      });

      const data = await res.json();

      if (res.ok) {
        setBlockedDevices(data.remaining || []);
        setStatus({ type: "success", text: "Device removed successfully." });
      } else {
        setStatus({ type: "error", text: data.message || "Failed." });
      }
    } catch {
      setStatus({ type: "error", text: "Server error." });
    } finally {
      setLoading("idle");
    }
  };

  /* ───────────────────────────────
     SPINNER
  ─────────────────────────────── */
  const Spinner = () => (
    <span
      style={{
        width: 14,
        height: 14,
        border: "2px solid rgba(0,0,0,0.2)",
        borderTop: "2px solid rgba(0,0,0,0.9)",
        borderRadius: "50%",
        display: "inline-block",
        animation: "spin 0.7s linear infinite",
      }}
    />
  );

  const getClientName = (ua: string) => {
    const agent = ua.toLowerCase();
  
    if (agent.includes("thunder client")) return "Thunder Client";
    if (agent.includes("edg")) return "Microsoft Edge";
    if (agent.includes("chrome")) return "Chrome";
    if (agent.includes("firefox")) return "Firefox";
    if (agent.includes("safari") && !agent.includes("chrome")) return "Safari";
    if (agent.includes("opera") || agent.includes("opr")) return "Opera";
    if (agent.includes("postman")) return "Postman";
  
    return "Unknown Device";
  };
  const btn: React.CSSProperties = {
    border: "none",
    borderRadius: 14,
    padding: "13px 16px",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: 14,
    transition: "0.2s",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  };

  /* ─────────────────────────────── */
  return (
    <div
      style={{
        background: theme.bg,
        display: "flex",
        justifyContent: "center",
        padding: 20,
        fontFamily: "Inter",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: theme.card,
          border: `1px solid ${theme.border}`,
          borderRadius: 24,
          padding: 26,
        }}
      >
        {/* ACTIVE STATE */}
        {activeKey && (
          <div
            style={{
              padding: 16,
              borderRadius: 14,
              marginBottom: 16,
              // background: "rgba(73,209,124,0.08)",
              // border: "1px solid rgba(73,209,124,0.25)",
            }}
          >
           
            <div
              style={{
                color: 'theme.text',
                fontWeight: 700,
                letterSpacing: 2,
                marginTop: 6,
                textAlign:'center'
              }}
            >
                <div style={{display:'flex', alignItems:'center', justifyContent:'center', gap:'7px'}}>
                  <div style={{fontSize:'15px', color:'gray'}}> Orpheus</div>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M8.6 22.5L6.7 19.3L3.1 18.5L3.45 14.8L1 12L3.45 9.2L3.1 5.5L6.7 4.7L8.6 1.5L12 2.95L15.4 1.5L17.3 4.7L20.9 5.5L20.55 9.2L23 12L20.55 14.8L20.9 18.5L17.3 19.3L15.4 22.5L12 21.05L8.6 22.5ZM10.95 15.55L16.6 9.9L15.2 8.45L10.95 12.7L8.8 10.6L7.4 12L10.95 15.55Z" fill="#C67100"/>
</svg>

                  </div> 

              {activeKey.length > 8
    ? `${activeKey.slice(0, 4)}...${activeKey.slice(-4)}`
    : activeKey}
            </div>
          </div>
        )}

        {/* INPUT */}
        {!activeKey && (
          <>
            <h2 style={{ color: theme.text }}>Activate License</h2>

            <input
              value={licenseKey}
              onChange={(e) => setLicenseKey(e.target.value)}
              placeholder="XXXX-XXXX-XXXX-XXXX"
              disabled={isBusy}
              style={{
                width: "100%",
                marginTop: 12,
                padding: 12,
                borderRadius: 14,
                background: theme.soft,
                border: `1px solid ${theme.border}`,
                color: theme.text,
                textAlign: "center",
                letterSpacing: 2,
              }}
            />

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
                marginTop: 16,
              }}
            >
              <button
               onMouseEnter={(e) => {
                // e.currentTarget.style.background = "#222";
                e.currentTarget.style.transform = "scale(1.06)";
          
              }}
              onMouseLeave={(e) => {
                // e.currentTarget.style.background = "#1a1a1a";
                e.currentTarget.style.transform = "scale(1)";
      
              }}
                onMouseDown={(e) => {
                  e.stopPropagation()
                  e.currentTarget.style.transform = "scale(0.96)";
              
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.transform = "scale(1.02)";
                }}


                onClick={activateLicense}
                disabled={isBusy}
                style={{
                  ...btn,
                  background: isBusy ? theme.disabled : baseColor,
                  color: "#000",
                }}
              >
                {loading === "activate" ? (
                  <>
                    <Spinner /> Activating
                  </>
                ) : (
                  "Activate"
                )}
              </button>

              <button
                  onMouseEnter={(e) => {
                    // e.currentTarget.style.background = "#222";
                    e.currentTarget.style.transform = "scale(1.06)";
              
                  }}
                  onMouseLeave={(e) => {
                    // e.currentTarget.style.background = "#1a1a1a";
                    e.currentTarget.style.transform = "scale(1)";
          
                  }}
                    onMouseDown={(e) => {
                      e.stopPropagation()
                      e.currentTarget.style.transform = "scale(0.96)";
                  
                    }}
                    onMouseUp={(e) => {
                      e.currentTarget.style.transform = "scale(1.02)";
                    }}
                style={{
                  ...btn,
                  background: theme.soft,
                  color: theme.sub,
                  border: `1px solid ${theme.border}`,
                }}
              >
                Buy
              </button>
            </div>
          </>
        )}

        {/* DEVICE LIMIT WARNING */}
        {activeKey && isOverLimit && (
          <div
            style={{
              marginTop: 16,
              padding: 12,
              borderRadius: 12,
              background: "rgba(255,94,94,0.08)",
              border: "1px solid rgba(255,94,94,0.2)",
              color: theme.red,
              fontWeight: 700,
            }}
          >
            ⚠ Device limit exceeded ({blockedDevices.length}/{MAX_DEVICES})
          </div>
        )}

        {/* DEVICE LIST */}
        {blockedDevices.map((d, i) => (
  <div
    key={i}
    style={{
      padding: "12px 14px",
      borderRadius: 12,
      background: theme.soft,
      border: `1px solid ${theme.border}`,
      marginBottom: 8,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    }}
  >
    <div>
      <div
        style={{
          color: theme.text,
          fontWeight: 600,
          fontSize: 13,
        }}
      >
        {getClientName(d.userAgent)}
      </div>

      <div
        style={{
          color: theme.sub,
          fontSize: 11,
          marginTop: 2,
        }}
      >
        {new Date(d.time).toLocaleDateString()}
      </div>
    </div>

    <button
      onMouseEnter={(e) => {
        // e.currentTarget.style.background = "#222";
        e.currentTarget.style.transform = "scale(1.06)";
  
      }}
      onMouseLeave={(e) => {
        // e.currentTarget.style.background = "#1a1a1a";
        e.currentTarget.style.transform = "scale(1)";

      }}
        onMouseDown={(e) => {
          e.stopPropagation()
          e.currentTarget.style.transform = "scale(0.96)";
      
        }}
        onMouseUp={(e) => {
          e.currentTarget.style.transform = "scale(1.02)";
        }}
      onClick={() => removeServerSlot(d.time)}
      disabled={isBusy}
      style={{
        width: 34,
        height: 34,
        borderRadius: 10,
        border: "none",
        cursor: "pointer",
        background: "rgba(255,94,94,0.12)",
        color: theme.red,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Trash2 size={16} />
    </button>
  </div>
))}

        {/* ALWAYS VISIBLE DELETE LICENSE (FIXED UX) */}
        {activeKey && (
          <button
          onMouseEnter={(e) => {
            // e.currentTarget.style.background = "#222";
            e.currentTarget.style.transform = "scale(1.06)";
      
          }}
          onMouseLeave={(e) => {
            // e.currentTarget.style.background = "#1a1a1a";
            e.currentTarget.style.transform = "scale(1)";
    
          }}
            onMouseDown={(e) => {
              e.stopPropagation()
              e.currentTarget.style.transform = "scale(0.96)";
          
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = "scale(1.02)";
            }}


            onClick={removeLocalLicense}
            disabled={isBusy}
            style={{
              ...btn,
              width: "100%",
              marginTop: 18,
              background: loading === "remove" ? theme.disabled : theme.red,
              color: "#fff",
            }}
          >
            {loading === "remove" ? (
              <>
                <Spinner /> Removing License
              </>
            ) : (
              <Trash2 />
            )}
          </button>
        )}

        {/* STATUS */}
        {status.text && (
          <div
            style={{
              marginTop: 16,
              padding: 12,
              borderRadius: 12,
              background:
                status.type === "success"
                  ? "rgba(73,209,124,0.1)"
                  : "rgba(255,94,94,0.1)",
              color: status.type === "success" ? theme.green : theme.red,
              fontWeight: 600,
            }}
          >
            {status.text}
          </div>
        )}

        {/* ANIMATION */}
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
};

export default LicenseManagement;