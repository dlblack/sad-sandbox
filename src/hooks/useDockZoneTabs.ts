import { useMemo } from "react";
import { DockContainer, DockZone } from "../types/dock";
import { CenterTab } from "../types/app";
import { getComponentLabel } from "../registry/componentRegistry";

export const useDockZoneTabs = (
  containers: DockContainer[],
  zone: DockZone
): CenterTab[] => {
  return useMemo(() => {
    return containers
      .filter((c) => c.dockZone === zone)
      .map((c) => {
        const baseProps = (c.props ?? {}) as Record<string, unknown>;
        const props: Record<string, unknown> = { ...baseProps, dataset: c.dataset };

        const title = c.title ?? getComponentLabel(c.type, props) ?? c.type;

        return {
          id: c.id,
          kind: c.type,
          title,
          props,
        };
      });
  }, [containers, zone]);
};
