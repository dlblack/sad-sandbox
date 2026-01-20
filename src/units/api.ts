import type { Dimension, UnitSystem } from "./types";
import { UNITS_REGISTRY } from "./registry";

export type LabelOptions = {
  bracketStyle?: "parentheses" | "square";
  omitUnit?: boolean;
};

export type UnitsApi = {
  unitSystem: UnitSystem;
  unitSymbol: (dimension: Dimension) => string;
  label: (base: string, dimension: Dimension, opts?: LabelOptions) => string;
};

export function createUnitsApi(unitSystem: UnitSystem): UnitsApi {
  function unitSymbol(dimension: Dimension): string {
    const def = UNITS_REGISTRY[dimension]?.[unitSystem];
    return def?.display ?? "";
  }

  function label(base: string, dimension: Dimension, opts?: LabelOptions): string {
    if (opts?.omitUnit) return base;

    const sym = unitSymbol(dimension);
    if (!sym) return base;

    const style = opts?.bracketStyle ?? "parentheses";
    const open = style === "square" ? "[" : "(";
    const close = style === "square" ? "]" : ")";
    return `${base} ${open}${sym}${close}`;
  }

  return { unitSystem, unitSymbol, label };
}
