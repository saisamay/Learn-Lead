const express = require("express");
const cors = require("cors");
const { exec } = require("child_process");
const fs = require("fs");

const app = express();

app.use(cors());
app.use(express.json());

app.post("/run", (req, res) => {

  const { code, language, input } = req.body;

  let fileName;
  let command;

  try {

    // =====================
    // JAVASCRIPT
    // =====================
    if (language === "javascript") {

      fileName = "script.js";
      fs.writeFileSync(fileName, code);

      command = `node ${fileName}`;

    }

    // =====================
    // PYTHON
    // =====================
    else if (language === "python") {

      fileName = "script.py";
      fs.writeFileSync(fileName, code);

      command = `python ${fileName}`;

    }

    // =====================
    // JAVA
    // =====================
    else if (language === "java") {

      fileName = "Main.java";
      fs.writeFileSync(fileName, code);

      command = `javac Main.java && java Main`;

    }

    // =====================
    // C++
    // =====================
    else if (language === "cpp") {

      fileName = "program.cpp";
      fs.writeFileSync(fileName, code);

      command = `g++ program.cpp -o program && program`;

    }

    const process = exec(command, (error, stdout, stderr) => {

      if (error) {

        let cleanError = stderr || error.message;

        // Extract line number
        const lineMatch = cleanError.match(/:(\d+):/);
        const lineNumber = lineMatch ? lineMatch[1] : null;

        // Extract main error message
        const errorMessage = cleanError
          .split("\n")
          .find(line => line.toLowerCase().includes("error"));

        return res.json({
          error: errorMessage || cleanError,
          line: lineNumber
        });

      }

      res.json({
        output: stdout || "Program executed successfully"
      });

    });

    // =====================
    // INPUT SUPPORT
    // =====================
    if (input) {

      process.stdin.write(input);
      process.stdin.end();

    }

  } catch (err) {

    res.json({
      error: "Execution failed"
    });

  }

});


// =====================
// HINT API
// =====================
app.post("/hint", (req, res) => {

  const { code, error } = req.body;

  let hint = "Check the syntax near the error.";
  let correctedCode = code;

  if (error) {

    if (error.includes("SyntaxError")) {
      hint = "There is a syntax error. Check brackets or missing symbols.";
    }

    if (error.includes("expected")) {
      hint = "The compiler expected a symbol like ';' or ')'.";
    }

    if (error.includes("not defined")) {
      hint = "You may be using a variable that has not been declared.";
    }

    if (error.includes("missing")) {
      hint = "Something is missing in your statement such as ')' or ';'.";
    }

  }

  res.json({
    hint,
    correctedCode
  });

});


// =====================
// START SERVER
// =====================
app.listen(5000, () => {

  console.log("Backend running on port 5000");

});