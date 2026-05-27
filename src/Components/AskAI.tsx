import React, { useEffect, useState } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";

interface ChildProps{
    element: HTMLElement | null;

}
// Initialize the API (Ideally, move this to a separate config file)
const genAI = new GoogleGenerativeAI("AIzaSyAmdXMmJwwr1AsmzpMB_Pvxz6D7VQXNNQM");


const AskAI: React.FC<ChildProps> = ({ element }) => {
  const [input, setInput] = useState<string>("");
  const [response, setResponse] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // Convert kebab-case keys to camelCase and apply styles
  const applyAIStyles = (el: HTMLElement, styles: Record<string, string>) => {
    if (!styles) return;
    for (const [key, value] of Object.entries(styles)) {
      const camelKey = key.replace(/-([a-z])/g, (_, char) => char.toUpperCase());
      (el.style as any)[camelKey] = value;
    }
  };

  // Remove markdown code fences and parse JSON safely
  const parseAIResponse = (text: string) => {
    try {
      let cleanText = text.trim();
      cleanText = cleanText.replace(/^```(json)?/, "").replace(/```$/, "").trim();
      return JSON.parse(cleanText);
    } catch (e) {
      console.error("Failed to parse AI JSON:", e, "\nOriginal text:", text);
      return null;
    }
  };

  // Sanitize image URLs to avoid invalid domains
  const sanitizeImageUrl = (url: string) => {
    try {
      const parsed = new URL(url);
      if (parsed.hostname.includes("fakeimg.pl")) {
        return `https://via.placeholder.com/600x400/cc0000/ffffff?text=Image`;
      }
      return url;
    } catch {
      // fallback for invalid URLs
      return `https://via.placeholder.com/600x400/cc0000/ffffff?text=Image`;
    }
  };

  // Append AI-generated elements at center of page
  const appendAIElements = (elements: any[]) => {
    if (!elements || elements.length === 0) return;

    // Create a container div centered
    const container = document.createElement("div");
    container.style.position = "fixed";
    container.style.top = "50%";
    container.style.left = "50%";
    container.style.transform = "translate(-50%, -50%)";
    container.style.zIndex = "9999";
    container.style.display = "flex";
    container.style.flexDirection = "column";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";
    container.style.gap = "10px";

    elements.forEach((el: any) => {
      const newEl = document.createElement(el.type);

      if (el.content) newEl.textContent = el.content;
      if (el.src && newEl instanceof HTMLImageElement) {
        newEl.src = sanitizeImageUrl(el.src);
      }

      if (el.style) applyAIStyles(newEl, el.style);

      container.appendChild(newEl);
    });

    document.body.appendChild(container);
  };

  const handleGenerate = async () => {
    if (!input) return;
    setLoading(true);

    try {
      const context = element?.innerHTML || "";

      const prompt = `
You are an AI assistant for web content.
Current element content:
${context}

User request:
${input}

Respond ONLY in JSON. You can return:
1. "style": an object with CSS properties to style the given element
2. "elements": an array of new HTML elements to generate. Each element should include:
   - type: tag name like "div", "img", "button"
   - content: optional text
   - src: optional image URL (for img)
   - style: optional CSS styles

When generating images, always use URLs from a reliable placeholder service like:
https://via.placeholder.com/<width>x<height>/<bg>/<fg>?text=<text>

Example response:
{
  "style": { "color": "red", "backgroundColor": "yellow" },
  "elements": [
    { "type": "img", "src": "https://via.placeholder.com/600x400/cc0000/ffffff?text=Image", "style": { "width": "600px", "height": "400px", "borderRadius": "8px" } },
    { "type": "div", "content": "Hello!", "style": { "color": "blue", "padding": "10px" } }
  ]
}
Do not include any extra text or markdown.
`;

      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      setResponse(text);

      const aiData = parseAIResponse(text);

      // Apply styles to existing element if provided
      if (aiData?.style && element) applyAIStyles(element, aiData.style);

      // Append new elements if provided
      if (aiData?.elements) appendAIElements(aiData.elements);
    } catch (error) {
      console.error("Gemini Error:", error);
      setResponse("Error: Could not reach the AI. Check your API key.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "400px", margin: "auto", fontFamily: "sans-serif" }}>
      <h2>Gemini AI Assistant</h2>

      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Ask me to style the element or generate HTML elements..."
        style={{ background:'transparent',color:'white',width: "100%", height: "100px", marginBottom: "10px", padding: "10px" }}
      />

      <button
        onClick={handleGenerate}
        disabled={loading}
        style={{ padding: "10px 20px", cursor: loading ? "not-allowed" : "pointer" }}
      >
        {loading ? "Thinking..." : "Generate Response"}
      </button>

      <div
        style={{
          marginTop: "20px",
          whiteSpace: "pre-wrap",
          borderTop: "1px solid #ccc",
          paddingTop: "10px",
        }}
      >
        <strong>Response:</strong>
        <p>{response || "Your answer will appear here."}</p>
      </div>
    </div>
  );
};

export default AskAI;










