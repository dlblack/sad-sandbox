import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/css/bootstrap/bootstrap.cyborg.min.css";
import "./styles/css/index.css";
import "../node_modules/react-grid-layout/css/styles.css";
import "../node_modules/react-resizable/css/styles.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
