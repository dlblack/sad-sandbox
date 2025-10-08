import React from "react";
import { createRoot } from "react-dom/client";

import { UISizingProvider } from "./uiSizing";
import App from "./App";
import AppProviders from "./ui/AppProviders";

import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/dates/styles.css";
import "material-icons/iconfont/material-icons.css";

import "./styles/css/index.css";
import "./styles/tokens.css";

const container = document.getElementById("root");
if (!container) {
    throw new Error("Root element not found");
}

createRoot(container).render(
    <React.StrictMode>
        <AppProviders>
            <UISizingProvider>
                <App />
            </UISizingProvider>
        </AppProviders>
    </React.StrictMode>
);
