# HEC-Neptune UI

A UI for interactive data analysis and visualization, integrating React, Vite, Node.js/Express, and Java utilities for DSS file operations.

---

## Features

- Modern React frontend (Vite)
- Express.js API backend
- Java-powered DSS (Data Storage System) integration
- Interactive maps and plots (Leaflet, Plotly.js)
- Drag-and-drop UI

---

## Prerequisites

**Assumed OS: Windows. (Linux/Mac: see notes below.)**

- **VS Code**  
  [Download and install VS Code](https://code.visualstudio.com/download).  
  (You may wish to rename/extract the folder as `C:\Programs\VSCode` to avoid path issues when downloading new versions.)

- **Node.js v22.12.0 or higher (includes npm)**  
  [Download Node.js](https://nodejs.org/en/download)  
  (Install or extract to `C:\Node`.)

- **Java Runtime Environment (JRE) or Java Development Kit (JDK), version 11 or higher**  
  - [Download OpenJDK 11+](https://www.oracle.com/java/technologies/downloads/archive/)
  - Must be installed and available on your PATH.
  - The backend uses Java for writing to DSS files.
  - Default path in `server.js` is:  
    `C:\Programs\jdk-11.0.11+9\bin\java.exe`  
    (Adjust if your Java is elsewhere.)

- **(Optional) Git**  
  For version control.

---

### Java & DSS Library Setup

**All required DSS .jar files and javaHeclib.dll are already included in the repo under /server/jar and /server/lib for convenience:**

- /server/jar/ — All required .jar files from HEC-DSSVue

- /server/lib/ — javaHeclib.dll native library

**No manual copying or external downloads needed!**

## Environment Variables

1. Open the Windows search and find  
   **“Edit environment variables for your account”**.
2. Edit the `Path` variable and **add:**
    - The path to your Node directory (`C:\Node`)
    - The VS Code `bin` folder (`C:\Programs\VSCode\bin`)
    - The Java `bin` folder (e.g., `C:\Programs\jdk-11.0.11+9\bin`)
    - (Optional) Git `cmd` folder if not present

**Test your setup:**  
Open a new command prompt (not inside the Node folder) and run:

```
node -v
npm -v
java -version
````
---

## Getting Started

1. Clone the repo and install dependencies
```
git clone <your-repo-url>
cd <repo-folder>
npm install
```

2. Start the backend server

Open a new terminal window or tab, then run:
```
cd server
node server.js
```

- This starts the Express backend at http://localhost:5001
- Java is invoed automatically for DSS file operations.
- If Java is not in the default path, edit `server.js` and set `javaPath` accordingly.

3. Start the frontend

- In a new terminal at the project root:
```
npm run dev
```

- This starts the Vite frontend at http://localhost:5173

To open as a standalone application, open a new terminal at the project root, and run:
npm run electron

There will be visual differences in the interface appearance, but functionality is unchanged.

---

## Folder Structure

```
hec-neptune/
├── index.html
├── package.json
├── public/
├── src/
│   └── [React source files]
├── server/
│   ├── DssWriter.class
│   ├── DssWriter.java
│   ├── server.js
│   ├── jar/
│   │   └── [All DSS .jar files]
│   ├── lib/
│   │   └── javaHeclib.dll
│   └── [data.json, analysis.json, etc.]
└── vite.config.js
```


---

## Useful NPM Scripts
- `npm run dev` -- Start frontend Vite dev server
- `npm run build` -- Build frontend for production
- `npm run preview` --Preview production build locally

---

## Main Dependencies
Frontend:
-React 19
-Vite
-Leaflet
-Plotly.js (not yet implemented)

Backend:
-express
-body-parser
-cors

Java/Server:
-heclib.jar and supporting .jar files for DSS (included in `/server/jar`)
-javaHeclib.dll native library (included in `/server/lib`)
---

## Troubleshooting
- If DSS file writing fails:

  - Make sure you have Java 11+ installed and in your PATH.

  - Ensure all .jar files are in server/jar and javaHeclib.dll is in server/lib.

  - Check server.js for the correct javaPath.

  - Check the backend terminal for Java or DSS errors.

- On other operating systems:

  - Java must be available on your PATH.

  - You may need to update classpath syntax (; vs :) in server.js.

  - Native libraries like javaHeclib.dll may not work; this setup is tested on Windows only.

- "Unable to initialize main class DssWriter" or "NoClassDefFoundError":

  - Usually means a required .jar is missing or Java is not pointing to the correct lib directory.

- "DLL not found" errors:

  - Make sure javaHeclib.dll is present in /server/lib.

---

## Notes

- Both the frontend and backend must be running for full app functionality.

- All necessary Java dependencies are bundled—no extra steps required.

- For development, keep both frontend and backend terminal windows open.

- For any issues, check the backend terminal output first.
