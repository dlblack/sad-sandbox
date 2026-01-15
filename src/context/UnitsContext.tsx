import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { UnitSystem } from "../units/types";
import { createUnitsApi, type UnitsApi } from "../units/api";

const UnitsContext = createContext<UnitsApi | null>(null);

export function UnitsProvider(props: { unitSystem: UnitSystem; children: ReactNode }) {
  const api = useMemo(() => createUnitsApi(props.unitSystem), [props.unitSystem]);
  return <UnitsContext.Provider value={api}>{props.children}</UnitsContext.Provider>;
}

export function useUnits(): UnitsApi {
  const ctx = useContext(UnitsContext);
  if (!ctx) throw new Error("useUnits() must be used within <UnitsProvider>.");
  return ctx;
}
