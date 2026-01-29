# HEC-Neptune UI

A desktop/web UI for interactive data analysis and visualization. The frontend is React + Vite (optionally packaged with Electron). The backend is an Express API that can call small Java utilities for HEC-DSS read/write operations.

---

## Features

- React 19 UI with Mantine components
- Vite dev server with `/api` proxy to the backend
- Optional Electron shell (same UI, desktop window + native dialogs)
- Express backend for project I/O and DSS operations
- Java helpers for DSS reading/writing (invoked by the backend)
- Plotting and mapping (Plotly.js + Leaflet)
- Popout windows (Electron + in-app popout routing)

---

## Prerequisites

- Node.js 22+ (npm included)
  [Download Node.js](https://nodejs.org/en/download)  
  (Install or extract to `C:\Node`.)
- Java 21+ (required only for DSS endpoints)
- Windows is the primary target for DSS (the repo includes `javaHeclib.dll`). Other OSes will require compatible native libraries.

---

## Getting Started

1) Install dependencies (project root)

```bash
npm install
```

2) Start the backend (Express)

```bash
node server/server.js
```

Backend runs on `http://localhost:5001`.

3) Start the frontend (Vite)

```bash
npm run dev
```

Frontend runs on `http://localhost:5173` and proxies `/api/*` to the backend.

4) Run as a desktop app (Electron)

```bash
npm run electron
```

Electron still expects the backend to be running on `http://localhost:5001`.

---

## DSS Setup Notes (Java + jars)

The backend builds a Java classpath from `server/jar/*.jar` and uses the native library in `server/lib/`.

- `server/lib/javaHeclib.dll` is present in this repo.

`server/server.js` currently uses a Windows Java path constant:

- `JAVA_BIN = "C:\Programs\jdk-21.0.8+9\bin\java.exe"`

Update that value if your Java is installed elsewhere, or change the implementation to use `java` from PATH.

---

## Project Structure

```
hec-neptune/
├── assets/                         # App assets (images, fonts, sample DSS)
│   ├── files/
│   ├── images/
│   └── webfonts/
├── public/                         # Static files served by Vite
│   ├── recentProjects.json
│   └── Testing/                    # Sample project + DSS files for local testing
├── server/                         # Express backend + Java DSS helpers
│   ├── server.js                   # Express API (DSS + project I/O)
│   ├── neptuneConfig.json          # Stores projectsRoot (defaults to ../NeptuneProjects)
│   ├── DssReader.java/.class       # Java DSS reader utility
│   ├── DssWriter.java/.class       # Java DSS writer utility
│   ├── DssPairedWriter.java/.class # Java DSS paired-data writer utility
│   ├── usgs/                       # USGS helper enums/utilities for backend writes
│   ├── lib/                        # Native DSS library (javaHeclib.dll)
│   └── jar/                        # DSS jar dependencies
├── src/                            # React application source
│   ├── api/                        # API clients (project I/O, USGS, etc.)
│   ├── app_components/             # Main UI components (dockable UI, plots, tables, editors)
│   ├── context/                    # React contexts (Project, Units)
│   ├── dialogs/                    # Modal dialogs
│   ├── hooks/                      # App hooks
│   ├── pages/                      # Route pages (Home, Project shell)
│   ├── popout/                     # Popout host/provider + IPC bridge types
│   ├── registry/                   # Component registry for dynamic/dockable UI
│   ├── styles/                     # CSS tokens + styles
│   ├── timeSeries/                 # Time series types/helpers
│   ├── types/                      # Shared app types
│   ├── units/                      # Unit system registry/helpers
│   ├── utils/                      # Utilities (resources, file helpers, wizard bus, etc.)
│   ├── App.tsx
│   └── main.tsx                    # React entry
├── src-electron/                   # Electron main + preload source
│   ├── main.ts
│   └── preload.ts
├── dist/                           # Build output (Vite) [generated]
├── dist-electron/                  # Build output (electron main/preload) [generated]
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## Useful NPM Scripts

- `npm run dev` — Start Vite dev server
- `npm run build` — Build frontend (and Electron main/preload via vite-plugin-electron)
- `npm run preview` — Preview the production build locally
- `npm run electron` — Build + run Electron
- `npm run typecheck` — TypeScript typecheck

---

## Troubleshooting

- DSS calls fail immediately:
  - Confirm Java is installed and the `JAVA_BIN` in `server/server.js` points to a valid `java.exe` (or update to use PATH).
  - Ensure `server/jar/` exists and contains the required `.jar` dependencies referenced by the Java utilities.
  - Confirm `server/lib/javaHeclib.dll` exists (Windows).

- Frontend `/api/*` requests fail:
  - Confirm the backend is running on `http://localhost:5001`.
  - Confirm Vite proxy is active (see `vite.config.ts`).

- Electron opens but features relying on `/api` fail:
  - Electron does not start the backend. Start `node server/server.js` separately.
