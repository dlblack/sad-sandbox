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

// Path to the analyses
const analysesFile = path.join(__dirname, "public", "Testing", "analysis.json");

// Load analyses as an object keyed by type
function readAnalyses() {
  if (fs.existsSync(analysesFile)) {
    const raw = fs.readFileSync(analysesFile, "utf-8");
    try {
      const obj = JSON.parse(raw);
      // If file is an array, migrate to object-of-arrays
      if (Array.isArray(obj)) {
        const out = {};
        for (const entry of obj) {
          const t = entry.type || "Unknown";
          if (!out[t]) out[t] = [];
          // Remove .type field from entry if you want
          out[t].push({ ...entry, type: undefined });
        }
        return out;
      }
      return obj;
    } catch {
      return {};
    }
  }
  return {};
}

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

  // If analyses is an array (old format), migrate it
  if (Array.isArray(analyses)) {
    const migrated = {};
    analyses.forEach(entry => {
      const t = entry.type || "Unknown";
      if (!migrated[t]) migrated[t] = [];
      const { type, ...rest } = entry;
      migrated[t].push(rest);
    });
    analyses = migrated;
  }

  // If analyses is empty ({}), initialize array for this type
  if (!analyses[type]) analyses[type] = [];
  analyses[type].push(data);

  // Sort entries by name for this type
  analyses[type].sort((a, b) => (a.name || "").localeCompare(b.name || ""));

  fs.writeFileSync(analysesFile, JSON.stringify(analyses, null, 2));
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`API server running at http://localhost:${PORT}/api/analyses`);
});
