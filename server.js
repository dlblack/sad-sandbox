import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

// === Analyses ===
const analysesFile = path.join(__dirname, "public", "Testing", "analysis.json");

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
  // Optional: sort by name
  analyses[type] = analyses[type].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  writeAnalyses(analyses);
  res.json({ success: true });
});

// === Data ===
const dataFile = path.join(__dirname, "public", "Testing", "data.json");

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

// Add new data
app.post("/api/data", (req, res) => {
  const { type, data } = req.body;
  if (!type || !data) {
    res.status(400).json({ error: "Invalid payload" });
    return;
  }
  let allData = readData();
  if (!allData[type]) allData[type] = [];
  allData[type].push(data);
  allData[type] = allData[type].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  writeData(allData);
  res.json({ success: true });
});

// Start server
app.listen(PORT, () => {
  console.log(`API server running at http://localhost:${PORT}/api/analyses`);
  console.log(`API server running at http://localhost:${PORT}/api/data`);
});
