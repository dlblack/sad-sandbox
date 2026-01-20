import type { Dimension, UnitSystem } from "./types";

export type UnitDef = {
  symbol: string;
  display: string;
};

export const UNITS_REGISTRY: Record<Dimension, Record<UnitSystem, UnitDef>> = {
  flow: {
    US: { symbol: "cfs", display: "cfs" },
    SI: { symbol: "m3/s", display: "m3/s" },
  },
};
