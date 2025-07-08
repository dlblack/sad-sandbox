import React from "react";
import ReactDOM from "react-dom/client";
import { StyleProvider } from "./styles/StyleContext";
import App from "./App";
import "./styles/css/bootstrap/bootstrap.cyborg.min.css";
import "./styles/css/index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <StyleProvider>
      <App />
    </StyleProvider>
  </React.StrictMode>
);
