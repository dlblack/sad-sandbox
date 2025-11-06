import React from "react";
import { createRoot } from "react-dom/client";

import { UISizingProvider } from "./uiSizing";
import { MantineProvider } from "@mantine/core";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import ProjectShell from "./pages/ProjectShell";
import HomePage from "./pages/HomePage";

import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/dates/styles.css";
import "material-icons/iconfont/material-icons.css";

import "./styles/css/index.css";
import "./styles/tokens.css";

const router = createBrowserRouter([
    { path: "/", element: <HomePage /> },
    { path: "/project/:projectName/*", element: <ProjectShell /> },
]);

createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <MantineProvider defaultColorScheme="auto">
            <UISizingProvider>
                <RouterProvider router={router} />
            </UISizingProvider>
        </MantineProvider>
    </React.StrictMode>
);
