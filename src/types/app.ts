import * as React from "react";

export type Id = string;

export interface CenterTab {
    id: Id;
    kind: string;
    title: string;
    props?: Record<string, unknown>;
}

export type ComponentCategory =
    | "panel"
    | "wizard"
    | "data editor"
    | "demo"

export type RegistryEntry = {
    label: string | ((props?: any) => string);
    menuGroup: string;
    Component: React.ComponentType<any>;
    centerTab: boolean;
    componentType: ComponentCategory;
    width?: number;
    height?: number;
    singleton?: boolean;
};

export type Registry = Record<string, RegistryEntry>;
