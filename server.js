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

// Path to the analyses file
const analysesFile = path.join(__dirname, "public", "Testing", "analysis.json");

// Read analyses with robust error handling
function readAnalyses() {
  if (!fs.existsSync(analysesFile)) {
    // Create file with an empty object if missing
    fs.writeFileSync(analysesFile, JSON.stringify({}, null, 2));
    return {};
  }
  try {
    const content = fs.readFileSync(analysesFile, "utf-8");
    return JSON.parse(content);
  } catch (err) {
    // Log and return safe fallback (but DO NOT overwrite)
    console.error(`Error reading or parsing analysis.json: ${err}`);
    return {};
  }
}

// Write analyses with robust error handling
function writeAnalyses(data) {
  try {
    const sortedKeys = Object.keys(data).sort((a, b) => a.localeCompare(b));
    const sorted = {};
    for (const key of sortedKeys) {
      sorted[key] = data[key];
    }
    fs.writeFileSync(analysesFile, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(`Error writing analysis.json: ${err}`);
  }
}

// Get analyses
app.get("/api/analyses", (req, res) => {
  res.json(readAnalyses());
});

// Add new analysis
app.post("/api/analyses", (req, res) => {
  const { type, data } = req.body;
  if (!type || !data) {
    res.status(400).json({ error: "Invalid payload" });
    return;
  }
  let analyses = readAnalyses();
  // Ensure type exists
  if (!analyses[type]) analyses[type] = [];
  analyses[type].push(data);
  // Sort by name within type
  analyses[type] = analyses[type].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  writeAnalyses(analyses);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`API server running at http://localhost:${PORT}/api/analyses`);
});
