import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { spawn } from "child_process";
import crypto from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

function getClassPath() {
  return fs.readdirSync(__dirname)
    .filter(f => f.endsWith('.jar'))
    .map(f => path.join(__dirname, f))
    .join(';') + ';.';
}

// === Analyses ===
const analysesFile = path.join(__dirname, "..", "public", "Testing", "analysis.json");

function readAnalyses() {
  if (!fs.existsSync(analysesFile)) {
    fs.writeFileSync(analysesFile, JSON.stringify({}, null, 2));
    return {};
  }
  try {
    const content = fs.readFileSync(analysesFile, "utf-8");
    return JSON.parse(content);
  } catch (err) {
    console.error(`Error reading or parsing analysis.json: ${err}`);
    return {};
  }
}

function writeAnalyses(data) {
  try {
    fs.writeFileSync(analysesFile, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(`Error writing analysis.json: ${err}`);
  }
}

app.get("/api/analyses", (req, res) => {
  res.json(readAnalyses());
});

app.post("/api/analyses", (req, res) => {
  const { type, data } = req.body;
  if (!type || !data) {
    res.status(400).json({ error: "Invalid payload" });
    return;
  }
  let analyses = readAnalyses();
  if (!analyses[type]) analyses[type] = [];
  analyses[type].push(data);
  analyses[type] = analyses[type].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  writeAnalyses(analyses);
  res.json({ success: true });
});

// === Data ===
const dataFile = path.join(__dirname, "..", "public", "Testing", "data.json");

// Read data.json
function readData() {
  if (!fs.existsSync(dataFile)) {
    fs.writeFileSync(dataFile, JSON.stringify({}, null, 2));
    return {};
  }
  try {
    const content = fs.readFileSync(dataFile, "utf-8");
    return JSON.parse(content);
  } catch (err) {
    console.error(`Error reading or parsing data.json: ${err}`);
    return {};
  }
}

// Write data.json
function writeData(data) {
  try {
    fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(`Error writing data.json: ${err}`);
  }
}

// Get all data
app.get("/api/data", (req, res) => {
  res.json(readData());
});

app.post("/api/data", (req, res) => {
  const { type, data } = req.body;
  if (!type || !data) {
    return res.status(400).json({ error: "Invalid payload" });
  }

  // Save metadata only (no values/times) always
  const { startDateTime, interval, values, times, ...dataForJson } = data;
  let allData = readData();
  if (!allData[type]) allData[type] = [];
  allData[type].push(dataForJson);
  allData[type] = allData[type].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  writeData(allData);

  // Only proceed to DSS writing if times/values exist
  if (!Array.isArray(values) || !Array.isArray(times) || !data.pathname || !data.filepath) {
    // Respond immediately (it's just a metadata save)
    return res.json({ success: true });
  }

  // --- Write to DSS only if real time series data ---
  const dssInput = {
    pathname: data.pathname,
    startDateTime,
    interval,
    values,
    times,
  };

  // Ensure tmp directory exists
  const tmpDir = path.join(__dirname, "tmp");
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

  // Unique filename
  const uniqueId = (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36));
  const tmpInputPath = path.join(tmpDir, `tmp_dss_input-${uniqueId}.json`);
  fs.writeFileSync(tmpInputPath, JSON.stringify(dssInput));

  const dssFilePath = path.resolve(__dirname, "..", data.filepath);
  const classpath = getClassPath();
  const javaPath = "C:\\Programs\\jdk-11.0.11+9\\bin\\java.exe"; // Update as needed

  const javaProc = spawn(javaPath, [
    "-cp", classpath,
    "DssWriter",
    tmpInputPath,
    dssFilePath
  ], { cwd: __dirname });

  let responded = false;

  // Utility to cleanup temp file
  function cleanupTmpFile() {
    try {
      fs.unlinkSync(tmpInputPath);
    } catch (e) {
      // Ignore errors (file might not exist, permission issues, etc.)
    }
  }

  javaProc.stdout.on('data', (data) => {
    console.log(`Java STDOUT: ${data}`);
  });
  javaProc.stderr.on('data', (data) => {
    console.error(`Java STDERR: ${data}`);
  });

  javaProc.on("exit", (code) => {
    console.log("Java exited with code:", code);
    cleanupTmpFile();
    if (!responded) {
      responded = true;
      if (code === 0) {
        res.json({ success: true });
      } else {
        res.status(500).json({ error: "Failed to write DSS" });
      }
    }
  });

  javaProc.on("error", (err) => {
    console.error("Java process error:", err);
    cleanupTmpFile();
    if (!responded) {
      responded = true;
      res.status(500).json({ error: "Java process error" });
    }
  });

  setTimeout(() => {
    if (!responded) {
      responded = true;
      cleanupTmpFile();
      res.status(500).json({ error: "Java process timeout" });
      javaProc.kill();
    }
  }, 10000);
});

// --- Rename Data ---
app.patch("/api/data/:category/:index", (req, res) => {
  const { category, index } = req.params;
  const { name } = req.body;
  let allData = readData();
  if (!allData[category] || !allData[category][index]) {
    return res.status(404).json({ error: "Not found" });
  }
  allData[category][index].name = name;
  writeData(allData);
  res.json({ success: true });
});


// --- Rename Analyses ---
app.patch("/api/analyses/:folder/:index", (req, res) => {
  const { folder, index } = req.params;
  const { name } = req.body;
  let analyses = readAnalyses();
  if (!analyses[folder] || !analyses[folder][index]) {
    return res.status(404).json({ error: "Not found" });
  }
  analyses[folder][index].name = name;
  writeAnalyses(analyses);
  res.json({ success: true });
});


// --- Delete from Data ---
app.delete("/api/data/:category/:index", (req, res) => {
  const { category, index } = req.params;
  let allData = readData();
  if (!allData[category] || !allData[category][index]) {
    return res.status(404).json({ error: "Not found" });
  }
  allData[category].splice(index, 1);
  if (allData[category].length === 0) {
    delete allData[category];
  }
  writeData(allData);
  res.json({ success: true });
});

// --- Delete from Analyses ---
app.delete("/api/analyses/:folder/:index", (req, res) => {
  const { folder, index } = req.params;
  let analyses = readAnalyses();
  if (!analyses[folder] || !analyses[folder][index]) {
    return res.status(404).json({ error: "Not found" });
  }
  analyses[folder].splice(index, 1);
  if (analyses[folder].length === 0) {
    delete analyses[folder];
  }
  writeAnalyses(analyses);
  res.json({ success: true });
});


// Start server
app.listen(PORT, () => {
  console.log(`API server running at http://localhost:${PORT}/api/analyses`);
  console.log(`API server running at http://localhost:${PORT}/api/data`);
});
