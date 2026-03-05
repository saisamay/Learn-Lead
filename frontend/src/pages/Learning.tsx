import { useState, useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";

interface HintMessage {
  hint: string;
  correctedCode: string;
}

export default function Learning() {

  const [code, setCode] = useState("// Write your code here");
  const [language, setLanguage] = useState("javascript");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [errorLine, setErrorLine] = useState<number | null>(null);
  const [hintData, setHintData] = useState<HintMessage | null>(null);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState("");

  const editorRef = useRef<any>(null);

  useEffect(() => {
    setOutput("");
    setError("");
    setHintData(null);
  }, [language]);

  // RUN CODE
  const runCode = async () => {

    setOutput("Running...");
    setError("");

    try {

      const res = await fetch("http://localhost:5000/run", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ code, language, input })
      });

      const data = await res.json();

      if (data.error) {
        setError(data.error);
        setErrorLine(data.line);
        setOutput("");
      } else {
        setOutput(data.output);
        setError("");
      }

    } catch (err) {
      setOutput("");
      setError("Server connection failed");
    }
  };

  // GET HINT
  const getHint = async () => {

    if (!error) return;

    setLoading(true);

    try {

      const res = await fetch("http://localhost:5000/hint", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ code, language, error })
      });

      const data = await res.json();

      setHintData({
        hint: data.hint || "Check the syntax near the error.",
        correctedCode: data.correctedCode || code
      });

    } catch {
      setHintData({
        hint: "Unable to generate hint.",
        correctedCode: code
      });
    }

    setLoading(false);
  };

  // APPLY FIX
  const applyFix = () => {

    if (!hintData || !hintData.correctedCode) return;

    const fixed = hintData.correctedCode.trim();

    setCode(fixed);

    if (editorRef.current) {

      const editor = editorRef.current;

      editor.setValue(fixed);
      editor.focus();
      editor.revealLine(1);

    }
  };

  const problems = [
    {
      title: "Sum of Two Numbers",
      description: "Write a program to add two numbers."
    },
    {
      title: "Print Numbers 1 to 10",
      description: "Use a loop to print numbers from 1 to 10."
    },
    {
      title: "Hello User",
      description: "Take input and print Hello <name>."
    }
  ];

  return (

    <div
      style={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        flexDirection: "column",
        background: "#121212",
        color: "#f5f5f5",
        overflow: "hidden",
        fontFamily: "Inter, sans-serif"
      }}
    >

      {/* HEADER */}

      <div
        style={{
          padding: "12px",
          textAlign: "center",
          fontSize: "22px",
          fontWeight: "600",
          borderBottom: "1px solid #2a2a2a",
          background: "#1b1b1b",
          color: "#facc15"
        }}
      >
        Learn & Lead
      </div>

      {/* MAIN GRID */}

      <div
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "1.6fr 1fr",
          gridTemplateRows: "1fr 1fr",
          gap: "1px",
          background: "#2a2a2a"
        }}
      >

        {/* CODE EDITOR */}

        <div style={{ background: "#121212", display: "flex", flexDirection: "column" }}>

          <div
            style={{
              padding: "10px",
              borderBottom: "1px solid #2a2a2a",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >

            <span style={{ fontWeight: 500 }}>Code Editor</span>

            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              style={{
                background: "#1e1e1e",
                color: "#facc15",
                border: "1px solid #333",
                padding: "5px 10px",
                borderRadius: "4px"
              }}
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
            </select>

          </div>

          <Editor
            height="100%"
            theme="vs-dark"
            language={language}
            value={code}
            onMount={(editor) => {
              editorRef.current = editor;
            }}
            onChange={(value) => setCode(value || "")}
          />

        </div>

        {/* HINT PANEL */}

        <div style={{ background: "#121212", padding: "16px", overflow: "auto" }}>

          <h3 style={{ color: "#facc15" }}>Hints</h3>

          <button
            onClick={getHint}
            disabled={!error || loading}
            style={{
              padding: "8px 16px",
              background: "#facc15",
              border: "none",
              borderRadius: "6px",
              color: "#000",
              fontWeight: 600,
              marginBottom: "15px",
              cursor: "pointer"
            }}
          >
            {loading ? "Generating..." : "Get Hint"}
          </button>

          {hintData && (
            <>
              <p>{hintData.hint}</p>

              <h4 style={{ marginTop: "15px", color: "#facc15" }}>
                Corrected Code
              </h4>

              <pre
                style={{
                  background: "#0d1117",
                  padding: "10px",
                  borderRadius: "6px",
                  border: "1px solid #333",
                  whiteSpace: "pre-wrap"
                }}
              >
                {hintData.correctedCode}
              </pre>

              <button
                onClick={applyFix}
                style={{
                  marginTop: "10px",
                  padding: "6px 12px",
                  background: "#facc15",
                  border: "none",
                  borderRadius: "6px",
                  color: "#000",
                  fontWeight: 600,
                  cursor: "pointer"
                }}
              >
                Apply Fix
              </button>
            </>
          )}

        </div>

        {/* OUTPUT */}

        <div style={{ background: "#121212", padding: "16px" }}>

          <h3 style={{ color: "#facc15" }}>Output</h3>

          <button
            onClick={runCode}
            style={{
              padding: "8px 16px",
              background: "#f5e833",
              border: "none",
              borderRadius: "6px",
              color: "#1e1e1e",
              marginBottom: "10px",
              cursor: "pointer"
            }}
          >
            Run Code
          </button>

          <textarea
            placeholder="Program input..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            style={{
              width: "100%",
              height: "60px",
              marginBottom: "10px",
              background: "#1e1e1e",
              color: "#ffffff",
              border: "1px solid #333",
              padding: "8px",
              borderRadius: "6px"
            }}
          />

          <div
            style={{
              background: "#0d1117",
              padding: "12px",
              minHeight: "120px",
              fontFamily: "monospace",
              borderRadius: "6px",
              border: "1px solid #30363d",
              whiteSpace: "pre-wrap",
              color: error ? "#ff6b6b" : "#f2dc1d"
            }}
          >
            {error
              ? `Error ${errorLine ? `(Line ${errorLine})` : ""}: ${error}`
              : output}
          </div>

        </div>

        {/* PRACTICE PROBLEMS */}

        <div style={{ background: "#121212", padding: "16px", overflow: "auto" }}>

          <h3 style={{ color: "#facc15" }}>Practice Problems</h3>

          {problems.map((p, i) => (
            <div
              key={i}
              style={{
                background: "#393939",
                padding: "12px",
                borderRadius: "8px",
                marginBottom: "12px",
                border: "1px solid #2a2a2a"
              }}
            >
              <strong style={{ color: "#facc15" }}>{p.title}</strong>
              <p style={{ fontSize: "13px", marginTop: "4px" }}>
                {p.description}
              </p>
            </div>
          ))}

        </div>

      </div>

    </div>
  );
}