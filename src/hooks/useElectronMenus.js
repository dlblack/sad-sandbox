import { useEffect, useRef } from "react";

export default function useElectronMenus(addComponent) {
  const addRef = useRef(addComponent);
  useEffect(() => {
    addRef.current = addComponent;
  }, [addComponent]);

  useEffect(() => {
    const api = window.electronAPI;
    if (!api?.onMenu) return;

    const offs = [];

    offs.push(api.onMenu("menu-file", (action) => {
      if (action === "create-new") {
        // TODO
      }
    }));

    offs.push(api.onMenu("menu-maps", (action) => {
      if (action === "open-map-window") {
        addRef.current("ComponentMap");
      }
    }));

    offs.push(api.onMenu("menu-data", (action) => {
      if (action === "manual-data-entry") addRef.current("ManualDataEntryEditor");
      else if (action === "import-usgs" || action === "usgs") {/* open USGS flow */}
      else if (action === "import-dss"  || action === "hec-dss") {/* open HEC-DSS flow */}
      else if (action === "edit-data") {/* open editor */}
      else if (action === "data-utilities") {/* open utilities */}
    }));

    offs.push(api.onMenu("menu-analysis", (type) => {
      addRef.current(type);
    }));

    offs.push(api.onMenu("menu-tools", (type) => {
      addRef.current(type);
    }));

    offs.push(api.onMenu("menu-help", (action) => {
      if (action === "about-hec-neptune") {
        // TODO
      }
    }));

    return () => {
      for (const off of offs) {
        try { off && off(); } catch {}
      }
    };
  }, []);
}
