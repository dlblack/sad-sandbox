import { useMemo } from "react";
import { DockContainer } from "../types/dock";
import { CenterTab } from "../types/app";
import { AppMessage } from "../types/messages";
import { getComponentLabel } from "../registry/componentRegistry";

export const useSouthZoneTabs = (
  containers: DockContainer[],
  messages: AppMessage[],
  removeComponent: (id: string) => void
): CenterTab[] => {
  return useMemo(() => {
    return containers
      .filter((c) => c.dockZone === "S")
      .map((c) => {
        const baseProps = (c.props ?? {}) as Record<string, unknown>;
        const labelProps: Record<string, unknown> = { ...baseProps, dataset: c.dataset };

        const title = c.title ?? getComponentLabel(c.type, labelProps) ?? c.type;

        const props: Record<string, unknown> = {
          ...baseProps,
          dataset: c.dataset,
          messages,
          onRemove: () => removeComponent(c.id),
        };

        return {
          id: c.id,
          kind: c.type,
          title,
          props,
        };
      });
  }, [containers, messages, removeComponent]);
};
