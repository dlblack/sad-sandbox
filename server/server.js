import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { spawn } from "child_process";
import { getUsgsServiceId, UsgsDataType } from "./usgs/UsgsDataType.js";

const log = (...a) => console.log(new Date().toISOString(), ...a);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5001;

app.use(cors());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

// -----------------------------
// USGS WRITE PROGRESS (SSE JOBS)
// -----------------------------
const JOBS = new Map();
const JOB_TTL_MS = 30 * 60 * 1000; // 30 min

function makeId() {
    return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function createJob() {
    const id = makeId();
    const job = {
        id,
        listeners: new Set(),
        last: null,
        done: false,
        pendingSeries: [],
        expectedTotal: 0,
        doneSoFar: 0,
    };
    JOBS.set(id, job);
    return job;
}

function getJob(id) {
    return id ? JOBS.get(id) : null;
}

function publish(job, payload) {
    if (!job) return;
    job.last = payload;

    const data = `data: ${JSON.stringify(payload)}\n\n`;
    for (const res of job.listeners) {
        res.write(data);
    }
}

function finish(job, payload) {
    if (!job) return;
    job.done = true;
    publish(job, payload);

    for (const res of job.listeners) {
        try {
            res.end();
        } catch {}
    }
    job.listeners.clear();
}

function attachSse(job, res) {
    res.status(200);
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders?.();

    job.listeners.add(res);

    if (job.last) {
        res.write(`data: ${JSON.stringify(job.last)}\n\n`);
    }

    res.on("close", () => {
        job.listeners.delete(res);
    });
}

// cleanup
setInterval(() => {
    const now = Date.now();
    for (const [id, job] of JOBS.entries()) {
        if (job.done && now - job.createdAt > 10 * 1000) {
            JOBS.delete(id);
            continue;
        }
        if (now - job.createdAt > JOB_TTL_MS) {
            JOBS.delete(id);
        }
    }
}, 60 * 1000);

// Create a job (client calls this before starting the DSS write)
// Optionally accepts { expectedTotal } so progress can span flow+stage writes.
app.post("/api/usgs/write-job", (req, res) => {
    const job = createJob();

    // Optional: if frontend sends expectedTotal, we’ll use it.
    const expectedTotal = Number(req.body?.expectedTotal ?? 0) || 0;
    if (expectedTotal > 0) job.expectedTotal = expectedTotal;

    res.json({ jobId: job.id });
});

// Subscribe to progress
app.get("/api/usgs/write-progress", (req, res) => {
    const jobId = String(req.query.jobId || "");
    const job = getJob(jobId);
    if (!job) return res.status(404).json({ error: "Job not found" });
    attachSse(job, res);
});

// --- Project Directory Configuration ---
const configPath = path.join(__dirname, "neptuneConfig.json");

function loadConfig() {
    try {
        if (!fs.existsSync(configPath)) {
            const defaultCfg = {
                projectsRoot: path.join(__dirname, "..", "NeptuneProjects"),
            };
            fs.writeFileSync(configPath, JSON.stringify(defaultCfg, null, 2));
            return defaultCfg;
        }
        return JSON.parse(fs.readFileSync(configPath, "utf8"));
    } catch {
        return { projectsRoot: path.join(__dirname, "..", "NeptuneProjects") };
    }
}

let CONFIG = loadConfig();
let PROJECTS_ROOT = CONFIG.projectsRoot;

app.get("/api/config", (_req, res) => {
    res.json({ projectsRoot: PROJECTS_ROOT });
});

app.post("/api/config", (req, res) => {
    const { projectsRoot } = req.body || {};

    if (!projectsRoot || typeof projectsRoot !== "string" || projectsRoot.trim() === "") {
        return res.status(400).json({ error: "Invalid projectsRoot" });
    }

    const normalized = path.resolve(projectsRoot.trim());

    CONFIG.projectsRoot = normalized;
    PROJECTS_ROOT = normalized;

    fs.writeFileSync(configPath, JSON.stringify(CONFIG, null, 2));
    console.log("Updated projectsRoot:", normalized);

    return res.json({ projectsRoot: normalized });
});

function fixSlashes(p) {
    return p ? p.replace(/\\/g, "/") : p;
}

function getProjectPathsArgAware(projectName, absDir) {
    if (absDir) absDir = fixSlashes(absDir);
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
    const delimiter = path.delimiter;

    const jars = fs.existsSync(jarsDir)
      ? fs
        .readdirSync(jarsDir)
        .filter((f) => f.endsWith(".jar"))
        .map((f) => path.join("jar", f))
      : [];

    return ["."].concat(jars).join(delimiter);
}

// Java constants
const JAVA_BIN = "C:\\Programs\\jdk-21.0.8+9\\bin\\java.exe";
const CLASS_PATH = getClassPath();

// Small helpers to DRY DSS metadata and temp JSON handling
function appendMetaAndSave(store, type, metaForJson, dataFile) {
    if (!store[type]) store[type] = [];
    store[type].push(metaForJson);
    writeJson(dataFile, store);
    return store;
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
    const filtered = list.filter((p) => !(p.projectName === item.projectName && p.directory === item.directory));
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
app.get("/api/projects", (_req, res) => {
    const projects = fs
      .readdirSync(PROJECTS_ROOT)
      .filter((file) => fs.statSync(path.join(PROJECTS_ROOT, file)).isDirectory());
    res.json({ projects });
});

// Open an existing project by file path (absolute .neptune file)
app.post("/api/open-project", (req, res) => {
    const { projectFilePath } = req.body;
    if (!projectFilePath) return res.status(400).json({ error: "Missing projectFilePath" });
    if (!/\.neptune$/i.test(projectFilePath))
        return res.status(400).json({ error: "Only .neptune files are allowed" });

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
    const absDir = fixSlashes(req.query.dir);
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

    res.json({ success: true, projectName, directory: projectDir });
});

// Fetch analyses for a specific project
app.get("/api/:project/analyses", (req, res) => {
    const { project } = req.params;
    const absDir = fixSlashes(req.query.dir);
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
    const absDir = fixSlashes(req.query.dir);
    if (!absDir) {
        log("GET data missing dir", { project });
        return res.status(400).json({ error: "Missing dir query param" });
    }
    const { dataFile } = getProjectPathsArgAware(project, absDir);
    res.json(readJson(dataFile, {}));
});

// USGS time series fetch (Daily, Instantaneous, Annual Peak later)
app.post("/api/usgs/timeSeries", async (req, res) => {
    try {
        const body = req.body || {};
        const stationId = body.stationId;
        const dataType = body.dataType;
        const variety = body.variety;
        const period = body.period;
        const startDate = body.startDate;
        const endDate = body.endDate;
        const retrievePor = body.retrievePor;
        const timeZone = body.timeZone;

        if (!stationId || !dataType || !variety) {
            return res.status(400).json({ error: "Missing stationId, dataType, or variety" });
        }

        if (dataType === "annualPeaks") {
            try {
                const url = new URL("https://nwis.waterdata.usgs.gov/nwis/peak/");
                url.searchParams.set("site_no", stationId);
                url.searchParams.set("format", "rdb");

                if (startDate && endDate) {
                    url.searchParams.set("start_dt", startDate);
                    url.searchParams.set("end_dt", endDate);
                }

                console.log("USGS annual peaks URL", url.toString());

                const upstream = await fetch(url.toString());
                const status = upstream.status;
                const text = await upstream.text();

                console.log("USGS annual peaks status", status);
                console.log("USGS annual peaks sample", text.slice(0, 400));

                if (!upstream.ok) {
                    return res.status(502).json({ error: "USGS upstream error", status });
                }

                const lines = text.split(/\r?\n/).filter((line) => line.length && line.charAt(0) !== "#");
                if (lines.length < 3) return res.json({ points: [] });

                const headerRow = lines[0].split("\t");
                const peakDtIdx = headerRow.indexOf("peak_dt");
                const peakTmIdx = headerRow.indexOf("peak_tm");
                const peakVaIdx = headerRow.indexOf("peak_va");

                if (peakDtIdx < 0 || peakVaIdx < 0) return res.json({ points: [] });

                const dataLines = lines.slice(2);
                const points = dataLines
                  .map((line) => {
                      const cols = line.split("\t");
                      const date = cols[peakDtIdx] || "";
                      const time = peakTmIdx >= 0 ? cols[peakTmIdx] || "" : "";
                      const rawVal = cols[peakVaIdx] || "";
                      const v = Number(rawVal);

                      if (!date || !Number.isFinite(v)) return null;

                      const trimmedTime = time.trim();
                      const timePart = trimmedTime || "00:00";
                      const timestamp = date + "T" + timePart + "Z";

                      return { timestamp, value: v };
                  })
                  .filter((p) => p !== null);

                return res.json({ points });
            } catch (err) {
                console.error("USGS annual peaks exception", err);
                return res.status(500).json({ error: "USGS annual peaks proxy failed" });
            }
        }

        const servicePath = dataType === UsgsDataType.ANNUAL_PEAKS ? null : getUsgsServiceId(dataType);
        const parameterCd = variety === "stage" ? "00065" : "00060";

        const url = new URL(`https://waterservices.usgs.gov/nwis/` + servicePath + `/`);
        url.searchParams.set("format", "json");
        url.searchParams.set("sites", stationId);
        url.searchParams.set("parameterCd", parameterCd);

        if (dataType === "daily" && retrievePor) {
            const today = new Date();
            const endIso = today.toISOString().slice(0, 10);

            const hyphen = String.fromCharCode(45);
            const startIso = ["1900", "01", "01"].join(hyphen);

            url.searchParams.set("startDT", startIso);
            url.searchParams.set("endDT", endIso);
        } else if (startDate && endDate) {
            url.searchParams.set("startDT", startDate);
            url.searchParams.set("endDT", endDate);
        } else {
            const periodToUse = period || "P30D";
            url.searchParams.set("period", periodToUse);
        }

        console.log("USGS timeSeries URL", url.toString());

        const upstream = await fetch(url.toString());
        const status = upstream.status;
        console.log("USGS upstream status", status);

        const text = await upstream.text();
        console.log("USGS upstream sample", text.slice(0, 400));

        if (!upstream.ok) {
            return res.status(502).json({ error: "USGS upstream error", status });
        }

        let json;
        try {
            json = JSON.parse(text);
        } catch (e) {
            console.error("USGS JSON parse error", e);
            return res.status(502).json({ error: "Bad JSON from USGS" });
        }

        const seriesArray =
          json && json.value && Array.isArray(json.value.timeSeries) ? json.value.timeSeries : [];
        if (!seriesArray.length) return res.json({ points: [] });

        const valuesBlocks = Array.isArray(seriesArray[0].values) ? seriesArray[0].values : [];
        if (!valuesBlocks.length) return res.json({ points: [] });

        const normTimeZone = timeZone === "UTC" || timeZone === "LOCAL_STANDARD" ? timeZone : "LOCAL_STANDARD";
        const rawValues = valuesBlocks[0].value || [];

        function toUtcIso(t) {
            const d = new Date(t);
            if (Number.isNaN(d.getTime())) return t;
            return d.toISOString();
        }

        function toLocalStandardIso(t) {
            if (!t) return t;
            const m = String(t).match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
            if (!m) return t;
            const year = m[1];
            const month = m[2];
            const day = m[3];
            const hh = m[4];
            const mm = m[5];
            return `${year}-${month}-${day}T${hh}:${mm}:00Z`;
        }

        const points = rawValues.map((v) => {
            const rawT = v && v.dateTime ? String(v.dateTime) : "";
            const val = v && typeof v.value === "string" ? Number(v.value) : null;

            let mappedT = rawT;
            if (rawT) {
                mappedT = normTimeZone === "UTC" ? toUtcIso(rawT) : toLocalStandardIso(rawT);
            }

            return { timestamp: mappedT, value: val };
        });

        if (points.length) {
            console.log("USGS mapped point sample", {
                timeZone: normTimeZone,
                raw: rawValues[0]?.dateTime,
                mapped: points[0]?.timestamp,
            });
        }

        return res.json({ points });
    } catch (err) {
        console.error("USGS proxy exception", err);
        return res.status(500).json({ error: "USGS proxy failed" });
    }
});

// POST /api/:project/:bucket  (append without re-sorting; keep indices stable)
app.post("/api/:project/:bucket", async (req, res) => {
    const body = req.body || {};
    const type = body.type;
    const data = body.data;
    const params = req.params;
    const project = params.project;
    const bucket = params.bucket;
    const absDir = fixSlashes(req.query.dir);

    if (!absDir) return res.status(400).json({ error: "Missing dir query param" });
    if (bucket !== "analyses" && bucket !== "data") return res.status(404).json({ error: "Unknown bucket" });
    if (!type || !data) return res.status(400).json({ error: "Invalid payload" });

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
        const isMultiSeries = Array.isArray(data.pathname) && Array.isArray(data.series);

        const metaForJson = {};
        Object.keys(data).forEach((key) => {
            if (
              key !== "startDateTime" &&
              key !== "interval" &&
              key !== "values" &&
              key !== "times" &&
              key !== "series"
            ) {
                metaForJson[key] = data[key];
            }
        });

        const filepath = metaForJson.filepath;

        if (!filepath) {
            appendMetaAndSave(store, type, metaForJson, dataFile);
            return res.json({ success: true, metaOnly: true });
        }

        appendMetaAndSave(store, type, metaForJson, dataFile);

        const baseDir = path.resolve(String(absDir));
        const dssFilePath = path.isAbsolute(filepath) ? filepath : path.resolve(baseDir, filepath);
        const dssDir = path.dirname(dssFilePath);
        if (!fs.existsSync(dssDir)) fs.mkdirSync(dssDir, { recursive: true });

        function writeOneSeriesToDss(seriesObj, interval, outFilePath, fallbackUnits, fallbackValueType) {
            return new Promise((resolve, reject) => {
                if (
                    !seriesObj ||
                    !seriesObj.pathname ||
                    !seriesObj.startDateTime ||
                    !Array.isArray(seriesObj.values) ||
                    !Array.isArray(seriesObj.times) ||
                    seriesObj.values.length === 0 ||
                    seriesObj.times.length === 0
                ) {
                    return resolve(false);
                }

                const dssInput = {
                    pathname: seriesObj.pathname,
                    startDateTime: seriesObj.startDateTime,
                    interval: interval,
                    values: seriesObj.values,
                    times: seriesObj.times,
                    units: seriesObj.units || fallbackUnits,
                    valueType: seriesObj.valueType || fallbackValueType,
                };

                const targetFile = outFilePath || dssFilePath;
                console.log("DSS output file", targetFile);

                const child = spawn(JAVA_BIN, ["-cp", CLASS_PATH, "DssWriter", targetFile], { cwd: __dirname });

                child.stdin.write(JSON.stringify(dssInput));
                child.stdin.end();

                child.stdout.on("data", (d) => console.log("JAVA DSS", d.toString()));
                child.stderr.on("data", (d) => console.error("JAVA DSS ERR", d.toString()));

                child.on("close", (code) => {
                    console.log("DSS writer exit code", code);
                    if (code !== 0) return reject(new Error("DssWriter failed with code " + code));
                    resolve(true);
                });
            });
        }

        // Multi-series (your USGS importer path)
        if (isMultiSeries) {
            const seriesArr = Array.isArray(data.series) ? data.series : [];
            const interval = data.interval;

            if (!interval || seriesArr.length === 0) {
                return res.json({ success: true, metaOnly: true });
            }

            const jobId = String(req.query.jobId || "");
            const job = getJob(jobId);

            // fallback: no job -> write immediately (to this request's file)
            if (!job) {
                for (const s of seriesArr) {
                    await writeOneSeriesToDss(s, interval, dssFilePath, data.units, data.valueType);
                }
                return res.json({ success: true, wrote: seriesArr.length });
            }

            // init buffer state on the job
            if (!Array.isArray(job.pendingSeries)) job.pendingSeries = [];
            if (!Number.isFinite(job.expectedTotal)) job.expectedTotal = 0;
            if (!Number.isFinite(job.doneSoFar)) job.doneSoFar = 0;

            // buffer THIS request's work + THIS request's output file
            job.pendingSeries.push({ seriesArr, interval, dssFilePath });
            job.expectedTotal += seriesArr.length;

            // wait for expected requests (stage+flow = 2; Annual Peaks = 1)
            const intervalLower = String(interval || "").toLowerCase();
            const expectedRequests = (intervalLower.includes("year") || intervalLower.startsWith("ir"))
                ? 1
                : 2;

            if (job.pendingSeries.length < expectedRequests) {
                return res.json({ success: true });
            }

            publish(job, {
                phase: "write",
                status: "starting",
                done: 0,
                total: job.expectedTotal,
                label: "Writing to DSS",
            });

            try {
                for (const block of job.pendingSeries) {
                    for (const s of block.seriesArr) {
                        const ok = await writeOneSeriesToDss(s, interval, dssFilePath, data.units, data.valueType);
                        job.doneSoFar += 1;

                        publish(job, {
                            phase: "write",
                            status: "writing",
                            done: job.doneSoFar,
                            total: job.expectedTotal,
                            label: "Writing to DSS",
                            wrote: !!ok,
                        });

                        await new Promise((r) => setImmediate(r));
                    }
                }

                finish(job, {
                    phase: "write",
                    status: "done",
                    done: job.doneSoFar,
                    total: job.expectedTotal,
                    label: "Finished writing data to disk",
                });

                return res.json({ success: true, wrote: job.doneSoFar });
            } catch (err) {
                console.error("Multi-series DSS write error", err);

                finish(job, {
                    phase: "write",
                    status: "error",
                    label: "Failed to write DSS file",
                    error: String(err && err.message ? err.message : err),
                });

                return res.status(500).json({ error: "Failed to write DSS file" });
            }
        }

        // Single-series (older path, in case something still uses it)
        const startDateTime = data.startDateTime;
        const interval = data.interval;
        const values = data.values;
        const times = data.times;
        const pathname = data.pathname;

        if (!pathname || !startDateTime || !interval || !values || !times) {
            return res.json({ success: true, metaOnly: true });
        }

        try {
            await writeOneSeriesToDss(
                { pathname, startDateTime, values, times, units: data.units, valueType: data.valueType },
                interval,
                dssFilePath,
                data.units,
                data.valueType
            );

            return res.json({ success: true });
        } catch (err) {
            console.error("Single-series DSS write error", err);
            return res.status(500).json({ error: "Failed to write DSS file" });
        }
    }

    if (data.dataFormat === "DSS" && data.structureType === "PairedData") {
        const xValues = data.xValues;
        const yValues = data.yValues;

        const metaForJson = {};
        Object.keys(data).forEach((key) => {
            if (key !== "xValues" && key !== "yValues") metaForJson[key] = data[key];
        });

        const filepath = metaForJson.filepath;
        const pathname = metaForJson.pathname;
        const xLabel = metaForJson.xLabel || "";
        const yLabel = metaForJson.parameter || metaForJson.yLabel || "";
        const xUnits = metaForJson.xUnits || "";
        const yUnits = metaForJson.yUnits || "";

        if (
          !filepath ||
          !pathname ||
          !Array.isArray(xValues) ||
          !Array.isArray(yValues) ||
          xValues.length === 0 ||
          yValues.length === 0 ||
          xValues.length !== yValues.length
        ) {
            appendMetaAndSave(store, type, metaForJson, dataFile);
            return res.json({ success: true, metaOnly: true });
        }

        appendMetaAndSave(store, type, metaForJson, dataFile);

        const dssInput = { pathname, xValues, yValues, xLabel, yLabel, xUnits, yUnits };

        const baseDir = path.resolve(String(absDir));
        const dssFilePath = path.isAbsolute(filepath) ? filepath : path.resolve(baseDir, filepath);
        const dssDir = path.dirname(dssFilePath);
        if (!fs.existsSync(dssDir)) fs.mkdirSync(dssDir, { recursive: true });

        console.log("DSS paired debug output dssFilePath", dssFilePath);
        console.log("DSS paired debug payload", JSON.stringify(dssInput).slice(0, 500));

        const child = spawn(JAVA_BIN, ["-cp", CLASS_PATH, "DssPairedWriter", dssFilePath], { cwd: __dirname });

        child.stdin.write(JSON.stringify(dssInput));
        child.stdin.end();

        child.stdout.on("data", (d) => console.log("JAVA PAIRED", d.toString()));
        child.stderr.on("data", (d) => console.error("JAVA PAIRED ERR", d.toString()));

        child.on("close", (code) => {
            console.log("DSS paired debug exit code", code);
            if (code !== 0) return res.status(500).json({ error: "Failed to write DSS paired file" });
            return res.json({ success: true });
        });

        return;
    }

    const storeData = store;
    if (!storeData[type]) storeData[type] = [];
    storeData[type].push(data);
    writeJson(dataFile, storeData);

    return res.json({ success: true });
});

// DELETE /api/:project/:bucket/:type/:index
app.delete("/api/:project/:bucket/:type/:index", (req, res) => {
    const { project, bucket, type, index } = req.params;
    const absDir = fixSlashes(req.query.dir);
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
        project,
        bucket,
        type,
        index,
        absDir,
        targetFile,
        fileExists: fs.existsSync(targetFile),
        listLen: list ? list.length : null,
    });

    if (!list) return res.status(404).json({ error: "Folder not found" });

    const i = Number(index);
    if (!Number.isInteger(i) || i < 0 || i >= list.length) {
        log("DELETE index out of range", { i, listLen: list.length });
        return res.status(404).json({ error: "Index out of range" });
    }

    const target = list[i];
    log("DELETE candidate", { i, name: target?.name });

    const [deleted] = list.splice(i, 1);
    if (list.length === 0) delete store[type];
    writeJson(targetFile, store);

    log("DELETE done", { i, remaining: list.length, deletedName: deleted?.name, wrote: targetFile });
    res.json({ success: true, deletedName: deleted?.name || "Unknown" });
});

// Read DSS for a specific project
app.get("/api/:project/read-dss", (req, res) => {
    const { file, path: pathname, dir } = req.query;
    if (!file || !pathname) return res.status(400).json({ error: "Missing DSS file or pathname" });

    const rawFile = String(file);
    const normFile = fixSlashes(rawFile);
    const normDir = dir ? fixSlashes(String(dir)) : null;

    let dssFile;

    if (path.isAbsolute(normFile)) {
        dssFile = normFile;
    } else if (normFile.startsWith("public/")) {
        dssFile = path.resolve(__dirname, "..", normFile);
    } else if (normDir) {
        dssFile = path.resolve(normDir, normFile);
    } else {
        dssFile = path.resolve(__dirname, "..", normFile);
    }

    const readerClass = "DssReader";

    const child = spawn(JAVA_BIN, ["-cp", CLASS_PATH, readerClass, dssFile, String(pathname)], { cwd: __dirname });

    child.on("error", (err) => {
        console.error("DssReader spawn error", err);
        return res.status(500).json({ error: "Failed to read DSS (spawn)" });
    });

    let output = "";
    child.stdout.on("data", (data) => {
        output += data.toString();
    });
    child.stderr.on("data", (data) => console.error("Java STDERR:", data.toString()));

    child.on("close", (code) => {
        if (code !== 0) return res.status(500).json({ error: "Failed to read DSS" });

        const jsonMatch = output.match(/\{[\s\S]*}/);
        if (!jsonMatch) return res.status(500).json({ error: "Invalid DSS JSON" });

        try {
            const parsed = JSON.parse(jsonMatch[0]);
            const x = parsed.x || parsed.times || [];
            const y = parsed.y || parsed.values || [];
            const yLabel = parsed.yLabel || "";
            const yUnits = parsed.yUnits || "";
            const valueType = parsed.valueType || parsed.type || "";

            res.json({ x, y, yLabel, yUnits, valueType });
        } catch {
            res.status(500).json({ error: "Invalid DSS JSON" });
        }
    });
});

app.use((err, req, res, next) => {
    console.error("GLOBAL EXPRESS ERROR HANDLER");
    console.error("  url:", req.originalUrl);
    console.error("  method:", req.method);
    console.error("  message:", err && err.message);
    console.error("  stack:", err && err.stack);

    if (res.headersSent) return next(err);

    res.status(err.status || 500).json({
        error: err.message || String(err),
    });
});

app.listen(PORT, () => {
    console.log(`API server running at http://localhost:${PORT}`);
});
