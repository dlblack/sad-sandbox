import React from "react";
import ReactDOM from "react-dom/client";
import { StyleProvider } from "./styles/StyleContext";
import { UISizingProvider } from "./uiSizing.jsx";
import App from "./App";
import "./styles/css/bootstrap/bootstrap.cyborg.min.css";
import "./styles/css/index.css";
import "./styles/tokens.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <UISizingProvider>
      <StyleProvider>
        <App/>
      </StyleProvider>
    </UISizingProvider>
  </React.StrictMode>
);
