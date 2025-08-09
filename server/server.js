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
const PORT = 5001;

app.use(cors());
app.use(bodyParser.json());

// Build classpath for Java execution
function getClassPath() {
    const jars = fs.readdirSync(path.join(__dirname, "jar"))
        .filter(f => f.endsWith('.jar'))
        .map(f => path.join("jar", f));
    return ['.', ...jars].join(';');
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

function readData() {
    if (!fs.existsSync(dataFile)) {
        fs.writeFileSync(dataFile, JSON.stringify({}, null, 2));
        return {};
    }
    try {
        const content = fs.readFileSync(dataFile, "utf-8");
        return JSON.parse(content);
    } catch (err) {
        return {};
    }
}

function writeData(data) {
    try {
        fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
    } catch (err) {
        console.error(`Error writing data.json: ${err}`);
    }
}

app.get("/api/data", (req, res) => {
    res.json(readData());
});

app.post("/api/data", (req, res) => {
    const { type, data } = req.body;

    if (!type || !data) {
        return res.status(400).json({ error: "Invalid payload" });
    }

    // === TimeSeries DSS ===
    if (
        data.structureType === "TimeSeries" &&
        data.dataFormat === "DSS" &&
        Array.isArray(data.values) &&
        Array.isArray(data.times) &&
        data.pathname &&
        data.filepath
    ) {
        const dssInput = {
            pathname: data.pathname,
            startDateTime: data.startDateTime,
            interval: data.interval,
            values: data.values,
            times: data.times,
        };

        const tmpDir = path.join(__dirname, "tmp");
        if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

        const uniqueId = (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36));
        const tmpInputPath = path.join(tmpDir, `tmp_dss_input-${uniqueId}.json`);
        fs.writeFileSync(tmpInputPath, JSON.stringify(dssInput));

        const dssFilePath = path.resolve(__dirname, "..", data.filepath);
        const classpath = getClassPath();
        const javaPath = "C:\\Programs\\jdk-11.0.11+9\\bin\\java.exe"; // Adjust if needed

        const javaProc = spawn(javaPath, [
            "-cp", classpath,
            "DssWriter",
            tmpInputPath,
            dssFilePath
        ], { cwd: __dirname });

        let responded = false;
        function cleanupTmpFile() {
            try { fs.unlinkSync(tmpInputPath); } catch (e) {}
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
                // Only write minimal to JSON
                let allData = readData();
                if (!allData[type]) allData[type] = [];
                const minimal = {
                    structureType: data.structureType,
                    dataFormat: data.dataFormat,
                    dataType: data.dataType,
                    name: data.name,
                    description: data.description,
                    filepath: data.filepath,
                    pathname: data.pathname
                };
                allData[type].push(minimal);
                allData[type] = allData[type].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
                writeData(allData);

                if (code === 0) res.json({ success: true });
                else res.status(500).json({ error: "Failed to write DSS" });
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
        return;
    }

    // === PairedData DSS ===
    if (
        data.structureType === "PairedData" &&
        data.dataFormat === "DSS" &&
        (
            (Array.isArray(data.xValues) && Array.isArray(data.yValues))
            || Array.isArray(data.rows)
        ) &&
        data.pathname &&
        data.filepath
    ) {
        let xValues, yValues;
        if (Array.isArray(data.xValues) && Array.isArray(data.yValues)) {
            xValues = data.xValues;
            yValues = data.yValues;
        } else if (Array.isArray(data.rows)) {
            const validRows = data.rows.filter(row =>
                row.x !== "" && row.y !== "" && !isNaN(Number(row.x)) && !isNaN(Number(row.y))
            );
            xValues = validRows.map(row => Number(row.x));
            yValues = validRows.map(row => Number(row.y));
        } else {
            return res.status(400).json({ error: "No paired values" });
        }

        const dssInput = {
            pathname: data.pathname,
            xLabel: data.xLabel,
            yLabel: data.yLabel || data.parameter || data.dataType,
            xUnits: data.xUnits,
            yUnits: data.yUnits || data.units,
            xValues,
            yValues,
        };

        const tmpDir = path.join(__dirname, "tmp");
        if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

        const uniqueId = (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36));
        const tmpInputPath = path.join(tmpDir, `tmp_paired_dss_input-${uniqueId}.json`);
        fs.writeFileSync(tmpInputPath, JSON.stringify(dssInput));

        const dssFilePath = path.resolve(__dirname, "..", data.filepath);
        const classpath = getClassPath();
        const javaPath = "C:\\Programs\\jdk-11.0.11+9\\bin\\java.exe"; // Adjust if needed

        const javaProc = spawn(javaPath, [
            "-cp", classpath,
            "DssPairedWriter", // <-- Java class for PairedData
            tmpInputPath,
            dssFilePath
        ], { cwd: __dirname });

        let responded = false;
        function cleanupTmpFile() {
            try { fs.unlinkSync(tmpInputPath); } catch (e) {}
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
                // Only write minimal to JSON (NO rows, xValues, yValues)
                let allData = readData();
                if (!allData[type]) allData[type] = [];
                const minimal = {
                    structureType: data.structureType,
                    dataFormat: data.dataFormat,
                    dataType: data.dataType,
                    name: data.name,
                    description: data.description,
                    yLabel: data.yLabel,
                    yUnits: data.yUnits,
                    xLabel: data.xLabel,
                    xUnits: data.xUnits,
                    filepath: data.filepath,
                    pathname: data.pathname
                };
                allData[type].push(minimal);
                allData[type] = allData[type].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
                writeData(allData);

                if (code === 0) res.json({ success: true });
                else res.status(500).json({ error: "Failed to write DSS PairedData" });
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
        return;
    }

    // === All others (JSON or PairedData/JSON etc.) ===
    let allData = readData();
    if (!allData[type]) allData[type] = [];
    allData[type].push(data);
    allData[type] = allData[type].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    writeData(allData);

    res.json({ success: true });
});

// --- READ DSS ---
app.get("/api/read-dss", (req, res) => {
    const { file, path: pathname } = req.query;

    if (!file || !pathname) {
        return res.status(400).json({ error: "Missing DSS file or pathname" });
    }

    const dssFile = path.resolve(__dirname, "..", file);
    const javaBin = "C:\\Programs\\jdk-11.0.11+9\\bin\\java.exe";
    const classPath = getClassPath();
    const readerClass = "DssReader";

    const child = spawn(
        javaBin,
        ["-cp", classPath, readerClass, dssFile, pathname],  // pass both file and pathname!
        { cwd: __dirname }
    );

    let output = "";
    child.stdout.on("data", (data) => (output += data.toString()));
    child.stderr.on("data", (data) => console.error("Java STDERR:", data.toString()));

    child.on("close", (code) => {
        if (code !== 0) return res.status(500).json({ error: "Failed to read DSS" });

        const jsonMatch = output.match(/\{[\s\S]*\}/);
        if (!jsonMatch) return res.status(500).json({ error: "Invalid DSS JSON" });

        try {
            const parsed = JSON.parse(jsonMatch[0]);
            console.log("DEBUG: API sending DSS data:", parsed);  // <-- Add this
            const x = parsed.x || parsed.times || [];
            const y = parsed.y || parsed.values || [];
            const yLabel = parsed.yLabel || "";
            const yUnits = parsed.yUnits || "";
            res.json({ x, y, yLabel, yUnits });
        } catch (err) {
            res.status(500).json({ error: "Invalid DSS JSON" });
        }
    });
});

// --- PATCH/DELETE: Data ---
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

// --- PATCH/DELETE: Analyses ---
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
