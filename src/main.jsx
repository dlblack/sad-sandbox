import React from "react";
import ReactDOM from "react-dom/client";
import { UISizingProvider } from "./uiSizing.jsx";
import App from "./App";
import "./styles/css/index.css";
import "./styles/tokens.css";
import AppProviders from "./ui/AppProviders.jsx";

import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/dates/styles.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppProviders>
      <UISizingProvider>
        <App/>
      </UISizingProvider>
    </AppProviders>
  </React.StrictMode>
);
