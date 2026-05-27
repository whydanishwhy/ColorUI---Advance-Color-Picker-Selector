import React, { useCallback } from "react";

type ExportElementProps = {
  element: HTMLElement | null;
};

export const ExportElement: React.FC<ExportElementProps> = ({ element }) => {
  const copyToClipboard = useCallback(async () => {
    if (!element) return;

    const exportId = `export-${Date.now()}`;
    const wrapperClass = `__${exportId}__`;

    // Clone element
    const cloned = element.cloneNode(true) as HTMLElement;
    cloned.classList.add(wrapperClass);

    const collectedRules = new Set<string>();
    const collectedFontFaces = new Set<string>();
    const collectedRootVars = new Set<string>();

    const elements = [cloned, ...Array.from(cloned.querySelectorAll("*"))];

    function processRules(rules: CSSRuleList) {
      for (const rule of Array.from(rules)) {
        try {
          // Normal style rule
          if (rule instanceof CSSStyleRule) {
            elements.forEach((el) => {
              if (el.matches(rule.selectorText)) {
                const scopedSelector = rule.selectorText
                  .split(",")
                  .map((sel) => `.${wrapperClass} ${sel.trim()}`)
                  .join(", ");

                collectedRules.add(
                  `${scopedSelector} { ${rule.style.cssText} }`
                );
              }
            });
          }

          // Media queries
          if (rule instanceof CSSMediaRule) {
            const mediaRules: string[] = [];

            Array.from(rule.cssRules).forEach((inner) => {
              if (inner instanceof CSSStyleRule) {
                elements.forEach((el) => {
                  if (el.matches(inner.selectorText)) {
                    const scopedSelector = inner.selectorText
                      .split(",")
                      .map((sel) => `.${wrapperClass} ${sel.trim()}`)
                      .join(", ");

                    mediaRules.push(
                      `${scopedSelector} { ${inner.style.cssText} }`
                    );
                  }
                });
              }
            });

            if (mediaRules.length) {
              collectedRules.add(
                `@media ${rule.conditionText} { ${mediaRules.join("\n")} }`
              );
            }
          }

          // Font face
          if (rule instanceof CSSFontFaceRule) {
            collectedFontFaces.add(rule.cssText);
          }

          // Root variables
          if (rule instanceof CSSStyleRule && rule.selectorText === ":root") {
            collectedRootVars.add(rule.cssText);
          }
        } catch (err) {
          // Ignore CORS-protected stylesheets
        }
      }
    }

    // Loop through stylesheets
    for (const sheet of Array.from(document.styleSheets)) {
      try {
        if (sheet.cssRules) {
          processRules(sheet.cssRules);
        }
      } catch (err) {
        // Ignore inaccessible stylesheets (CORS)
      }
    }

    const finalCSS = `
${Array.from(collectedFontFaces).join("\n")}
${Array.from(collectedRootVars).join("\n")}
${Array.from(collectedRules).join("\n")}
    `;

    const exportHTML = `
<style>
${finalCSS}
</style>

${cloned.outerHTML}
    `;

    await navigator.clipboard.writeText(exportHTML);
    alert("Element copied with styles!");
  }, [element]);

  return (
    <button
      onClick={copyToClipboard}
      disabled={!element}
      style={{
        padding: "8px 16px",
        background: "#111",
        color: "#fff",
        borderRadius: "6px",
        cursor: "pointer",
      }}
    >
      Copy Element With Styles
    </button>
  );
};
