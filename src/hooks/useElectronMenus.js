import { useEffect } from "react";

export default function useElectronMenus(addComponent) {
  useEffect(() => {
    if (!window.electronAPI) return;

    window.electronAPI.onMenu("menu-file", (action) => {
      if (action === "create-new") {
        // TODO: Show modal, clear state, etc
      }
    });

    window.electronAPI.onMenu("menu-maps", (action) => {
      if (action === "open-map-window") {
        addComponent("ComponentMap");
      }
    });

    window.electronAPI.onMenu("menu-data", (action) => {
      if (action === "manual-data-entry") addComponent("ManualDataEntryEditor");
      if (action === "usgs") addComponent("USGS");
      if (action === "hec-dss") addComponent("HEC-DSS");
      if (action === "data-utilities") addComponent("DataUtilities");
    });

    window.electronAPI.onMenu("menu-analysis", (action) => {
      addComponent(action);
    });

    window.electronAPI.onMenu("menu-tools", (action) => {
      addComponent(action);
    });

    window.electronAPI.onMenu("menu-help", (action) => {
      if (action === "about-sad") {
        // Show About dialog, etc
      }
    });
  }, [addComponent]);
}
