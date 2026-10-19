import { useState } from "react";
import { Highlight, themes } from "prism-react-renderer";
import { getTeachingCode } from "../getTeachingCode.js";

export default function CodeViewer({ source, filename }) {
  const [showFullFile, setShowFullFile] = useState(false);
  const [copyStatus, setCopyStatus] = useState("");

  // Both views come from the actual source file.
  const displayedCode = showFullFile ? source.trim() : getTeachingCode(source);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(displayedCode);
      setCopyStatus("Copied.");
    } catch {
      // Clipboard access can fail. Keep the code available to select.
      setCopyStatus("Couldn't copy. Select the code to copy it manually.");
    }
  }

  return (
    <section className="code-panel" aria-label="Example source code">
      <header className="code-toolbar">
        <div>
          <h2>Read the implementation</h2>
          <p>{filename}</p>
        </div>

        <button onClick={handleCopy}>Copy code</button>
      </header>

      <div className="code-options">
        <label>
          <input
            type="checkbox"
            checked={showFullFile}
            onChange={(event) => {
              setShowFullFile(event.target.checked);
              setCopyStatus("");
            }}
          />
          Show full file
        </label>

        <span role="status">{copyStatus}</span>
      </div>

      <Highlight theme={themes.vsDark} code={displayedCode} language="jsx">
        {({ style, tokens, getLineProps, getTokenProps }) => (
          <pre
            className="code-content"
            style={style}
            tabIndex={0}
            aria-label={`${filename} source code`}
          >
            <code>
              {tokens.map((line, lineIndex) => (
                <span
                  key={lineIndex}
                  {...getLineProps({ line })}
                  className="code-line"
                >
                  {line.map((token, tokenIndex) => (
                    <span key={tokenIndex} {...getTokenProps({ token })} />
                  ))}
                  {"\n"}
                </span>
              ))}
            </code>
          </pre>
        )}
      </Highlight>
    </section>
  );
}
