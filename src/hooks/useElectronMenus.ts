import { useEffect, useRef } from "react";

type ElectronUnsubscribe = () => void;

type ElectronAPI = {
    onMenu: (channel: string, handler: (payload: unknown) => void) => ElectronUnsubscribe | void;
};

type WithElectronAPI = Window & { electronAPI?: ElectronAPI };

export default function useElectronMenus(
    addComponent: (type: string, props?: Record<string, unknown>) => void
): void {
    const addRef = useRef(addComponent);

    useEffect(() => {
        addRef.current = addComponent;
    }, [addComponent]);

    useEffect(() => {
        const api = (window as WithElectronAPI).electronAPI;
        if (!api?.onMenu) return;

        const offs: Array<ElectronUnsubscribe | void> = [];

        // File
        offs.push(
            api.onMenu("menu-file", (action) => {
                if (action === "create-new") {
                    // TODO: implement
                }
            })
        );

        // Maps
        offs.push(
            api.onMenu("menu-maps", (action) => {
                if (action === "open-map-window") {
                    addRef.current?.("ComponentMap");
                }
            })
        );

        // Data
        offs.push(
            api.onMenu("menu-data", (action) => {
                if (action === "manual-data-entry") {
                    addRef.current?.("ManualDataEntryEditor");
                } else if (action === "import-usgs" || action === "usgs") {
                    // TODO: open USGS flow
                } else if (action === "import-dss" || action === "hec-dss") {
                    // TODO: open HEC-DSS flow
                } else if (action === "edit-data") {
                    // TODO: open editor
                } else if (action === "data-utilities") {
                    // TODO: open utilities
                }
            })
        );

        // Analysis
        offs.push(
            api.onMenu("menu-analysis", (type) => {
                if (typeof type === "string" && type) {
                    addRef.current?.(type);
                }
            })
        );

        // Tools
        offs.push(
            api.onMenu("menu-tools", (type) => {
                if (typeof type === "string" && type) {
                    addRef.current?.(type);
                }
            })
        );

        // Help
        offs.push(
            api.onMenu("menu-help", (action) => {
                if (action === "about-hec-neptune") {
                    // TODO: implement About
                }
            })
        );

        return () => {
            for (const off of offs) {
                try {
                    if (typeof off === "function") off();
                } catch {
                    // ignore
                }
            }
        };
    }, []);
}
