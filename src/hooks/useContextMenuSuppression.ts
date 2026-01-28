import { useEffect } from "react";

const STORAGE_KEY = "suppressBrowserContextMenu";

export function useContextMenuSuppression() {
  useEffect(() => {
    const shouldSuppress = getSuppressBrowserContextMenu();

    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      e.preventDefault();
    };

    if (shouldSuppress) {
      document.addEventListener("contextmenu", handleContextMenu);
    }

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, []);
}

export function setSuppressBrowserContextMenu(suppress: boolean) {
  localStorage.setItem(STORAGE_KEY, String(suppress));
  window.dispatchEvent(new CustomEvent("contextMenuSuppressionChanged"));
}

export function getSuppressBrowserContextMenu(): boolean {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === null) {
    return true;
  }
  return stored === "true";
}
