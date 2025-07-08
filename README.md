# HEC-SAD Web Application

A web app for interactive data analysis and visualization, integrating React, Vite, Node.js/Express, and Java utilities for DSS file operations.

---

## Features

- Modern React frontend (Vite)
- Express.js API backend
- Java-powered DSS (Data Storage System) integration
- Interactive maps and plots (Leaflet, Plotly.js)
- Drag-and-drop UI

---

## Prerequisites

**These instructions assume the use of VS Code on Windows.**

- **VS Code**  
  [Download and install VS Code](https://code.visualstudio.com/download).  
  (You may wish to rename/extract the folder as `C:\Programs\VSCode` to avoid path issues when downloading new versions.)

- **Node.js v18 or higher (includes npm)**  
  [Download Node.js](https://nodejs.org/en/download)  
  (Install or extract to `C:\Node`.)

- **Java Runtime Environment (JRE) or Java Development Kit (JDK)**  
  - Java is needed for disk write functions via the Java utilities in `/server`.
  - The default `server.js` points to:  
    `C:\Programs\jdk-11.0.11+9\bin\java.exe`  
    (Adjust as needed for your setup.)
  - [Download Java (JRE or JDK)](https://www.oracle.com/java/technologies/downloads/archive/)

- **(Optional) Git**  
  For version control.

---

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
node -v
npm -v
java -version

---

## Getting Started

1. Install Dependencies

After cloning the repo, from the project root directory run:
npm install

2. Start the Frontend (Vite Dev Server)

From the project root, run:
npm run dev

This starts the Vite development server at http://localhost:5173

3. Start the Backend Server

Open a new terminal window or tab, then run:
cd server
node server.js

The backend Express server runs on http://localhost:5000

Note: The backend server uses Java for DSS file operations.
Make sure you have Java installed and available in your PATH.

4. Access the App

Open your browser and go to:
http://localhost:5173

---

## Folder Structure

```text
ssp-playground/
├── index.html
├── package.json
├── public/
├── src/
│   └── [React source files]
├── server/
│   ├── DssWriter.class
│   ├── DssWriter.java
│   ├── server.js
│   └── [*.jar and .json files]
└── vite.config.js
```


---

## Useful NPM Scripts
npm run dev (Start frontend Vite dev server)
npm run build (Build for production)
npm run preview (Preview production build locally)

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

heclib.jar and supporting .jar files for DSS

---

## Notes
Both the frontend and backend must be running for full app functionality.

The backend automatically loads all needed Java classpath dependencies from the /server directory.

For development, leave both terminals open (one for frontend, one for backend).