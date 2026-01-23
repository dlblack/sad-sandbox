import { useCallback, useEffect, useRef, useState } from "react";
import { openWizard, wizardBus } from "../utils/wizardBus";
import { CenterTab } from "../types/app";
import { getComponentLabel, getComponentRegistryEntry } from "../registry/componentRegistry";

type OpenPayload = { kind: string; props?: unknown };

export const useCenterTabs = (opts?: {
  logOpened?: (type: string, title: string) => void;
  logClosed?: (type: string, title: string) => void;
  logAlreadyOpen?: (type: string, title: string) => void;
}) => {
  const [tabs, setTabs] = useState<CenterTab[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  const tabsRef = useRef<CenterTab[]>([]);
  useEffect(() => {
    tabsRef.current = tabs;
  }, [tabs]);

  const addTab = useCallback(
    (payload: OpenPayload) => {
      const kind = payload.kind;
      const propsObj =
        payload.props && typeof payload.props === "object"
          ? (payload.props as Record<string, unknown>)
          : ({} as Record<string, unknown>);

      const entry = getComponentRegistryEntry(kind);
      const isSingleton = entry?.singleton === true;

      const currentTabs = tabsRef.current;

      if (isSingleton) {
        const existing = currentTabs.find((t) => t.kind === kind);
        if (existing) {
          setActiveId(existing.id);
          opts?.logAlreadyOpen?.(kind, existing.title);
          return;
        }
      }

      const title = getComponentLabel(kind, propsObj) || kind;
      const id = isSingleton ? kind : `wiz_${Math.random().toString(36).slice(2, 9)}`;

      const newTab: CenterTab = { id, kind, title, props: propsObj };

      setTabs([...currentTabs, newTab]);
      setActiveId(id);
      opts?.logOpened?.(kind, title);
    },
    [opts]
  );

  useEffect(() => {
    const off = wizardBus.onOpen(addTab);
    return () => off();
  }, [addTab]);

  const closeTab = useCallback(
    (id: string) => {
      const closing = tabsRef.current.find((t) => t.id === id);
      if (closing) opts?.logClosed?.(closing.kind, closing.title);

      setTabs((prev) => {
        const idx = prev.findIndex((t) => t.id === id);
        if (idx < 0) return prev;

        const next = [...prev.slice(0, idx), ...prev.slice(idx + 1)];

        setActiveId((cur) => {
          if (cur !== id) return cur;
          const prevNeighbor = next.slice(0, idx).pop();
          const neighbor = prevNeighbor ?? next[idx] ?? null;
          return neighbor ? neighbor.id : null;
        });

        return next;
      });
    },
    [opts]
  );

  useEffect(() => {
    if (!tabs.length) {
      if (activeId !== null) setActiveId(null);
      return;
    }
    if (!tabs.some((t) => t.id === activeId)) {
      setActiveId(tabs[tabs.length - 1].id);
    }
  }, [tabs, activeId]);

  const openCenter = useCallback((type: string, props: Record<string, unknown> = {}) => {
    openWizard(type, props);
  }, []);

  return { tabs, activeId, setActiveId, closeTab, openCenter };
};
