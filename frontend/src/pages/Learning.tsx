import { useState, useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";

interface Message {
  level: number;
  text: string;
}

export default function Learning() {
  const [code, setCode] = useState("// Write your code here");
  const [question, setQuestion] = useState("");
  const [hintLevel, setHintLevel] = useState(1);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState("javascript");
  const [output, setOutput] = useState("");

  const pyodideRef = useRef<any>(null);

  useEffect(() => {
    setHintLevel(1);
    setMessages([]);
    setOutput("");
  }, [language]);

  // ==============================
  // LOAD PYODIDE (VITE SAFE)
  // ==============================
  const loadPyodideOnce = async () => {
    if (pyodideRef.current) return pyodideRef.current;

    const pyodideModule = await import(
      "https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.mjs"
    );

    pyodideRef.current = await pyodideModule.loadPyodide({
      indexURL: "https://cdn.jsdelivr.net/pyodide/v0.23.4/full/",
    });

    return pyodideRef.current;
  };

  // ==============================
  // RUN CODE
  // ==============================
  const runCode = async () => {
    setOutput("");

    // -------- JAVASCRIPT --------
    if (language === "javascript") {
      try {
        const originalLog = console.log;
        let logs: string[] = [];

        console.log = (...args) => {
          logs.push(args.join(" "));
        };

        eval(code);

        console.log = originalLog;
        setOutput(logs.join("\n") || "Code executed successfully.");
      } catch (error: any) {
        setOutput("JavaScript Error: " + error.message);
      }
      return;
    }

    // -------- PYTHON --------
    if (language === "python") {
      try {
        setOutput("Loading Python (first time takes few seconds)...");
        const pyodide = await loadPyodideOnce();

        pyodide.runPython(`
import sys
from io import StringIO
sys.stdout = StringIO()
        `);

        await pyodide.runPythonAsync(code);

        const stdout = pyodide.runPython("sys.stdout.getvalue()");
        setOutput(stdout || "Code executed successfully.");
      } catch (error: any) {
        setOutput("Python Error: " + error.message);
      }
      return;
    }

    setOutput("Execution not supported for this language yet.");
  };

  // ==============================
  // SMART HINT SYSTEM
  // ==============================
  const getHint = async () => {
    if (hintLevel > 3) return;

    setLoading(true);

    const lowerQuestion = question.toLowerCase();
    const lowerCode = code.toLowerCase();

    const generateHint = () => {
      if (lowerQuestion.includes("add")) {
        const usingMinus = lowerCode.includes("-");

        if (hintLevel === 1)
          return "Level 1: What operation is currently being performed?";
        if (hintLevel === 2)
          return "Level 2: Which operator performs addition?";
        if (hintLevel === 3)
          return usingMinus
            ? "Level 3: You are using '-' (subtraction). Replace it with '+'."
            : "Level 3: Ensure you are using '+' for addition.";
      }

      if (lowerQuestion.includes("loop")) {
        if (hintLevel === 1)
          return "Level 1: What controls how many times the loop runs?";
        if (hintLevel === 2)
          return "Level 2: Examine the loop condition.";
        if (hintLevel === 3)
          return "Level 3: Ensure the loop condition eventually becomes false.";
      }

      if (
        lowerQuestion.includes("error") ||
        lowerQuestion.includes("wrong")
      ) {
        if (hintLevel === 1)
          return "Level 1: What error or output are you seeing?";
        if (hintLevel === 2)
          return "Level 2: Check the specific line causing the issue.";
        if (hintLevel === 3)
          return "Level 3: Review syntax and operators carefully.";
      }

      if (hintLevel === 1)
        return "Level 1: What is the goal of this code?";
      if (hintLevel === 2)
        return "Level 2: Break the problem into logical steps.";
      if (hintLevel === 3)
        return "Level 3: Trace the code step by step.";

      return "";
    };

    const hint = generateHint();

    setTimeout(() => {
      setMessages((prev) => [...prev, { level: hintLevel, text: hint }]);
      setHintLevel((prev) => prev + 1);
      setLoading(false);
    }, 500);
  };

  const maxLevelReached = hintLevel > 3;

  return (
    <div style={{ display: "flex", height: "100vh", background: "#121212", color: "white" }}>
      {/* LEFT PANEL */}
      <div style={{ flex: 1 }}>
        <Editor
          height="100%"
          language={language}
          theme="vs-dark"
          value={code}
          onChange={(value) => setCode(value || "")}
        />
      </div>

      {/* RIGHT PANEL */}
      <div style={{ flex: 1, padding: "25px", overflowY: "auto" }}>
        <h2>AI Learning Mode</h2>

        <p>Current Hint Level: {Math.min(hintLevel, 3)}</p>

        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          style={{ padding: "8px", borderRadius: "6px", marginBottom: "15px" }}
        >
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
          <option value="cpp">C++</option>
        </select>

        <textarea
          placeholder="Ask your question..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          style={{
            width: "100%",
            height: "90px",
            padding: "10px",
            borderRadius: "8px",
            marginBottom: "15px",
            background: "#1e1e1e",
            color: "white",
            border: "1px solid #333",
          }}
        />

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={getHint}
            disabled={loading || maxLevelReached}
            style={{
              padding: "10px 20px",
              borderRadius: "8px",
              background: maxLevelReached ? "#555" : "#2563eb",
              color: "white",
              border: "none",
            }}
          >
            {loading ? "Loading..." : "Get Hint"}
          </button>

          <button
            onClick={runCode}
            style={{
              padding: "10px 20px",
              borderRadius: "8px",
              background: "#16a34a",
              color: "white",
              border: "none",
            }}
          >
            Run Code
          </button>
        </div>

        <hr style={{ margin: "25px 0", borderColor: "#333" }} />

        <h3>AI Responses</h3>

        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              background: "#1e1e1e",
              padding: "12px",
              borderRadius: "8px",
              marginBottom: "10px",
              borderLeft: "4px solid #2563eb",
            }}
          >
            <strong>Hint Level {msg.level}</strong>
            <p>{msg.text}</p>
          </div>
        ))}

        <hr style={{ margin: "25px 0", borderColor: "#333" }} />

        <h3>Output</h3>

        <div
          style={{
            background: "#000",
            padding: "12px",
            borderRadius: "8px",
            minHeight: "80px",
            color: "#22c55e",
            fontFamily: "monospace",
          }}
        >
          {output}
        </div>
      </div>
    </div>
  );
}