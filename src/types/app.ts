import * as React from "react";

export type Id = string;

export interface CenterTab {
    id: Id;
    kind: string;
    title: string;
    props?: Record<string, unknown>;
}

export interface RegistryEntry {
    title: ((props?: unknown) => string) | string;
    typeClass: string;
    Component: React.ComponentType<any>;
}
export type Registry = Record<string, RegistryEntry>;

export interface DockContainer {
    id: Id;
    type: string;
    dockZone: "W" | "E" | "S" | "CENTER";
    dataset?: unknown;
    props?: Record<string, unknown>;
}

export interface AppMessage {
    id: Id;
    level: "info" | "warn" | "error";
    text: string;
}
