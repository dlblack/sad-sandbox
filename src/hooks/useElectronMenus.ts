import { useEffect, useRef } from "react";
import { invokeFileMenu } from "../utils/fileMenuBus";

type Unsub = () => void;

type ElectronAPI = {
    onMenu?: (channel: string, handler: (payload: unknown) => void) => Unsub | void;
};

type WithElectron = Window & { electronAPI?: ElectronAPI };

type OpenComponent = (type: string, props?: Record<string, unknown>) => void;

export default function useElectronMenus(openComponent: OpenComponent): void {
    const openRef = useRef(openComponent);
    useEffect(() => { openRef.current = openComponent; }, [openComponent]);

    useEffect(() => {
        const api = (window as unknown as WithElectron).electronAPI;
        if (!api?.onMenu) return;

        const offs: Array<Unsub | void> = [];

        // File
        offs.push(
            api.onMenu("menu-file", (action) => {
                switch (action) {
                    case "create-new": invokeFileMenu("openNew"); break;
                    case "open":       invokeFileMenu("openOpen"); break;
                    case "close":      invokeFileMenu("closeProject"); break;
                    case "save":       invokeFileMenu("saveProject"); break;
                }
            })
        );

        // Maps
        offs.push(
            api.onMenu("menu-maps", (action) => {
                if (action === "open-map-window") {
                    openRef.current("ComponentMap");
                }
            })
        );

        // Analysis
        offs.push(
            api.onMenu("menu-analysis", (type) => {
                if (typeof type === "string" && type) {
                    openRef.current(type);
                }
            })
        );

        // Tools
        offs.push(
            api.onMenu("menu-tools", (type) => {
                if (typeof type === "string" && type) {
                    openRef.current(type);
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
