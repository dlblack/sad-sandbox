import { useCallback, useEffect, useState } from "react";

type TabLike = { id: string };

export const useZoneTabs = <T extends TabLike>(
  tabs: readonly T[],
  onCloseId: (id: string) => void
) => {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (tabs.length === 0) {
      setActiveId(null);
      return;
    }

    setActiveId((prev) => {
      if (prev && tabs.some((t) => t.id === prev)) return prev;
      return tabs[0].id;
    });
  }, [tabs]);

  const closeTab = useCallback(
    (id: string) => {
      onCloseId(id);
    },
    [onCloseId]
  );

  return { activeId, setActiveId, closeTab };
};
