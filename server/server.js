import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { spawn } from "child_process";

const log = (...a) => console.log(new Date().toISOString(), ...a);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5001;

app.use(cors());
app.use(bodyParser.json());

// --- Project Directory Configuration ---
const PROJECTS_ROOT = path.join(__dirname, "..", "public", "Projects");

// Resolve per-project files; if absDir is provided, use it as an absolute folder
function getProjectPathsArgAware(projectName, absDir) {
    const projectDir = absDir ? path.resolve(absDir) : path.join(PROJECTS_ROOT, projectName);
    return {
        projectDir,
        analysesFile: path.join(projectDir, "analysis.json"),
        dataFile: path.join(projectDir, "data.json"),
    };
}

// --- Read/Write Helper Functions ---
function readJson(filePath, defaultValue = {}) {
    try {
        return JSON.parse(fs.readFileSync(filePath, "utf-8"));
    } catch (e) {
        console.error(`Error reading JSON from ${filePath}:`, e);
        return defaultValue;
    }
}

function writeJson(filePath, data) {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
    } catch (e) {
        console.error(`Error writing JSON to ${filePath}:`, e);
    }
}

// Classpath helper for DSS Java reader/writer jars
function getClassPath() {
    const jarsDir = path.join(__dirname, "jar");
    const jars = fs.existsSync(jarsDir)
      ? fs.readdirSync(jarsDir).filter(f => f.endsWith(".jar")).map(f => path.join("jar", f))
      : [];
    return ["." , ...jars].join(";");
}

// --- API Routes ---
const recentPath = path.join(__dirname, "..", "public", "recentProjects.json");

function readRecent() {
    try {
        if (!fs.existsSync(recentPath)) fs.writeFileSync(recentPath, "[]");
        const raw = fs.readFileSync(recentPath, "utf8");
        const arr = JSON.parse(raw);
        return Array.isArray(arr) ? arr : [];
    } catch {
        return [];
    }
}

function writeRecent(list) {
    const safe = Array.isArray(list) ? list.slice(0, 5) : [];
    fs.writeFileSync(recentPath, JSON.stringify(safe, null, 2));
}

function bumpRecent(list, item) {
    const filtered = list.filter(
      p => !(p.projectName === item.projectName && p.directory === item.directory)
    );
    filtered.unshift(item);
    return filtered.slice(0, 5);
}

app.get("/api/recentProjects", (_req, res) => {
    res.json(readRecent());
});

app.post("/api/recentProjects", (req, res) => {
    const { projectName, directory } = req.body || {};
    if (!projectName || !directory) return res.status(400).json({ error: "Missing fields" });
    const next = bumpRecent(readRecent(), { projectName, directory });
    writeRecent(next);
    res.json(next);
});

// List all projects under the default root
app.get("/api/projects", (req, res) => {
    const projects = fs.readdirSync(PROJECTS_ROOT).filter(file =>
      fs.statSync(path.join(PROJECTS_ROOT, file)).isDirectory()
    );
    res.json({ projects });
});

// Open an existing project by file path (absolute .neptune file)
app.post("/api/open-project", (req, res) => {
    const { projectFilePath } = req.body;
    if (!projectFilePath) return res.status(400).json({ error: "Missing projectFilePath" });
    if (!/\.neptune$/i.test(projectFilePath)) return res.status(400).json({ error: "Only .neptune files are allowed" });

    try {
        const raw = fs.readFileSync(projectFilePath, "utf-8");
        const meta = JSON.parse(raw);
        if (!meta || typeof meta.projectName !== "string" || typeof meta.directory !== "string") {
            return res.status(400).json({ error: "Invalid project file" });
        }
        res.json({ projectName: meta.projectName, directory: meta.directory });
    } catch {
        res.status(500).json({ error: "Failed to read project file" });
    }
});

// Fetch project metadata
app.get("/api/:project/metadata", (req, res) => {
    const { project } = req.params;
    const absDir = req.query.dir;
    const { projectDir } = getProjectPathsArgAware(project, absDir);
    const projectJsonFile = path.format({ dir: projectDir, base: `${project}.neptune` });
    if (!fs.existsSync(projectJsonFile)) {
        return res.status(404).json({ error: "Project metadata not found" });
    }
    res.json(readJson(projectJsonFile, {}));
});

// Create a new project at a chosen directory
app.post("/api/projects", (req, res) => {
    const { projectName, directory, unitSystem } = req.body;

    if (!projectName || !directory || /[\\/:*?"<>|]/.test(projectName)) {
        return res.status(400).json({ error: "Invalid project name or directory" });
    }

    const projectDir = path.join(directory, projectName);
    const analysesFile = path.join(projectDir, "analysis.json");
    const dataFile = path.join(projectDir, "data.json");
    const projectJsonFile = path.format({ dir: projectDir, base: `${projectName}.neptune` });

    if (fs.existsSync(projectDir)) {
        return res.status(409).json({ error: "Project already exists" });
    }

    fs.mkdirSync(projectDir, { recursive: true });

    const projectMetadata = {
        projectName,
        directory: projectDir,
        unitSystem: unitSystem || "US",
        created_at: new Date().toISOString(),
        last_modified: new Date().toISOString(),
    };
    writeJson(projectJsonFile, projectMetadata);
    writeJson(analysesFile, {});
    writeJson(dataFile, {});

    const next = bumpRecent(readRecent(), { projectName, directory: projectDir });
    writeRecent(next);

    // return the absolute directory so the client can persist it
    res.json({ success: true, projectName, directory: projectDir });
});

// Fetch analyses for a specific project
app.get("/api/:project/analyses", (req, res) => {
    const { project } = req.params;
    const absDir = req.query.dir;
    if (!absDir) {
        log("GET analyses missing dir", { project });
        return res.status(400).json({ error: "Missing dir query param" });
    }
    const { analysesFile } = getProjectPathsArgAware(project, absDir);
    res.json(readJson(analysesFile, {}));
});

// Fetch data for a specific project
app.get("/api/:project/data", (req, res) => {
    const { project } = req.params;
    const absDir = req.query.dir;
    if (!absDir) {
        log("GET data missing dir", { project });
        return res.status(400).json({ error: "Missing dir query param" });
    }
    const { dataFile } = getProjectPathsArgAware(project, absDir);
    res.json(readJson(dataFile, {}));
});

// POST /api/:project/:bucket  (append without re-sorting; keep indices stable)
app.post("/api/:project/:bucket", (req, res) => {
    const body = req.body || {};
    const type = body.type;
    const data = body.data;
    const params = req.params;
    const project = params.project;
    const bucket = params.bucket;
    const absDir = req.query.dir;

    if (!absDir) {
        return res.status(400).json({ error: "Missing dir query param" });
    }
    if (bucket !== "analyses" && bucket !== "data") {
        return res.status(404).json({ error: "Unknown bucket" });
    }
    if (!type || !data) {
        return res.status(400).json({ error: "Invalid payload" });
    }

    const paths = getProjectPathsArgAware(project, absDir);
    const analysesFile = paths.analysesFile;
    const dataFile = paths.dataFile;

    if (bucket === "analyses") {
        const store = readJson(analysesFile, {});
        if (!store[type]) store[type] = [];
        store[type].push(data);
        writeJson(analysesFile, store);
        return res.json({ success: true });
    }

    const store = readJson(dataFile, {});

    if (data.dataFormat === "DSS" && data.structureType === "TimeSeries") {
        const startDateTime = data.startDateTime;
        const interval = data.interval;
        const values = data.values;
        const times = data.times;

        const metaForJson = {};
        Object.keys(data).forEach((key) => {
            if (
              key !== "startDateTime" &&
              key !== "interval" &&
              key !== "values" &&
              key !== "times"
            ) {
                metaForJson[key] = data[key];
            }
        });

        const filepath = metaForJson.filepath;
        const pathname = metaForJson.pathname;

        if (!filepath || !pathname || !startDateTime || !interval || !values || !times) {
            return res.status(400).json({ error: "Missing DSS fields" });
        }

        if (!store[type]) store[type] = [];
        store[type].push(metaForJson);
        writeJson(dataFile, store);

        const dssInput = {
            pathname: pathname,
            startDateTime: startDateTime,
            interval: interval,
            values: values,
            times: times
        };

        const tmpInputPath = path.join(__dirname, "tmp_dss_input.json");
        fs.writeFileSync(tmpInputPath, JSON.stringify(dssInput, null, 2), "utf-8");

        const baseDir = path.resolve(String(absDir));
        const dssFilePath = path.isAbsolute(filepath)
          ? filepath
          : path.resolve(baseDir, filepath);
        const dssDir = path.dirname(dssFilePath);
        if (!fs.existsSync(dssDir)) {
            fs.mkdirSync(dssDir, { recursive: true });
        }

        console.log("DSS debug input file", tmpInputPath);
        console.log("DSS debug output dssFilePath", dssFilePath);
        console.log("DSS debug payload", JSON.stringify(dssInput));

        const javaBin = "C:\\Programs\\jdk-11.0.11+9\\bin\\java.exe";
        const classPath = getClassPath();

        const child = spawn(
          javaBin,
          ["-cp", classPath, "DssWriter", tmpInputPath, dssFilePath],
          { cwd: __dirname }
        );

        child.stdout.on("data", (d) => console.log("JAVA", d.toString()));
        child.stderr.on("data", (d) => console.error("JAVA ERR", d.toString()));

        child.on("close", (code) => {
            console.log("DSS debug exit code", code);
            if (code !== 0) {
                return res.status(500).json({ error: "Failed to write DSS file" });
            }
            return res.json({ success: true });
        });

        return;
    }

    const storeData = store;
    if (!storeData[type]) storeData[type] = [];
    storeData[type].push(data);
    writeJson(dataFile, storeData);

    res.json({ success: true });
});

// DELETE /api/:project/:bucket/:type/:index
app.delete("/api/:project/:bucket/:type/:index", (req, res) => {
    const { project, bucket, type, index } = req.params;
    const absDir = req.query.dir;
    const { analysesFile, dataFile } = getProjectPathsArgAware(project, absDir || "");

    if (!absDir) {
        log("DELETE missing dir", { project, bucket, type, index });
        return res.status(400).json({ error: "Missing dir query param" });
    }
    if (bucket !== "analyses" && bucket !== "data") {
        log("DELETE unknown bucket", { project, bucket, type, index });
        return res.status(404).json({ error: "Unknown bucket" });
    }

    const targetFile = bucket === "analyses" ? analysesFile : dataFile;
    const store = readJson(targetFile, {});
    const list = Array.isArray(store[type]) ? store[type] : null;

    log("DELETE start", {
        project, bucket, type, index,
        absDir, targetFile, fileExists: fs.existsSync(targetFile),
        listLen: list ? list.length : null
    });

    if (!list) {
        log("DELETE folder not found", { type, keys: Object.keys(store) });
        return res.status(404).json({ error: "Folder not found" });
    }

    const i = Number(index);
    if (!Number.isInteger(i) || i < 0 || i >= list.length) {
        log("DELETE index out of range", { i, listLen: list.length });
        return res.status(404).json({ error: "Index out of range" });
    }

    const target = list[i];
    log("DELETE candidate", { i, name: target?.name, snapshot: JSON.stringify(target).slice(0, 200) });

    const [deleted] = list.splice(i, 1);
    if (list.length === 0) delete store[type];
    writeJson(targetFile, store);

    log("DELETE done", {
        i, remaining: list.length, deletedName: deleted?.name, wrote: targetFile
    });

    res.json({ success: true, deletedName: deleted?.name || "Unknown" });
});

// Read DSS for a specific project
// GET /api/:project/read-dss?file=<path>&path=<pathname>&dir=<absProjectDir>
app.get("/api/:project/read-dss", (req, res) => {
    const { file, path: pathname, dir } = req.query;

    if (!file || !pathname) {
        return res.status(400).json({ error: "Missing DSS file or pathname" });
    }

    const fileStr = String(file);
    const dssFile = path.isAbsolute(fileStr)
      ? fileStr
      : dir
        ? path.resolve(String(dir), fileStr)
        : path.resolve(__dirname, "..", fileStr);

    const javaBin = "C:\\Programs\\jdk-11.0.11+9\\bin\\java.exe";
    const classPath = getClassPath();
    const readerClass = "DssReader";

    const child = spawn(
      javaBin,
      ["-cp", classPath, readerClass, dssFile, String(pathname)],
      { cwd: __dirname }
    );

    let output = "";
    child.stdout.on("data", (data) => { output += data.toString(); });
    child.stderr.on("data", (data) => console.error("Java STDERR:", data.toString()));

    child.on("close", (code) => {
        if (code !== 0) return res.status(500).json({ error: "Failed to read DSS" });

        const jsonMatch = output.match(/\{[\s\S]*\}/);
        if (!jsonMatch) return res.status(500).json({ error: "Invalid DSS JSON" });

        try {
            const parsed = JSON.parse(jsonMatch[0]);
            const x = parsed.x || parsed.times || [];
            const y = parsed.y || parsed.values || [];
            const yLabel = parsed.yLabel || "";
            const yUnits = parsed.yUnits || "";
            res.json({ x, y, yLabel, yUnits });
        } catch {
            res.status(500).json({ error: "Invalid DSS JSON" });
        }
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`API server running at http://localhost:${PORT}`);
});
