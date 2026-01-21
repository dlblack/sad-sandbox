export type DockZone = "W" | "E" | "S" | "CENTER";

export type DockContainerBase = {
  id: string;
  type: string;
  dockZone: DockZone;

  title?: string;

  width: number;
  height: number;

  x?: number;
  y?: number;

  dataset?: unknown;
  props?: Record<string, unknown>;

  componentType?: string;
  singleton?: boolean;
  centerTab?: boolean;
};

export type DockContainer = DockContainerBase;
