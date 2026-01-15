import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef } from "react";
import type {
  PopoutBounds,
  PopoutKind,
  PopoutMessage,
  PopoutModelByKind,
  PopoutOpenRequest,
} from "./popoutTypes";
import TextStore from "../utils/TextStore";

type RefreshHandler = () => void;

type PopoutEntry<K extends PopoutKind = PopoutKind> = {
  id: string;
  kind: K;
  title: string;
  ownerKey?: string;
  refresh?: RefreshHandler;
  bounds?: PopoutBounds;
  webWindow?: Window | null;
};

type PopoutApi = {
  isOpen: (id: string) => boolean;

  open: <K extends PopoutKind>(req: PopoutOpenRequest<K>, handlers?: { onRefresh?: RefreshHandler }) => void;
  close: (id: string) => void;

  updateModel: <K extends PopoutKind>(id: string, kind: K, model: PopoutModelByKind[K]) => void;

  closeByOwner: (ownerKey: string) => void;
};

const PopoutContext = createContext<PopoutApi | null>(null);

const LS_BOUNDS_KEY = "neptune.popout.bounds";

function readAllBounds(): Record<string, PopoutBounds> {
  try {
    const raw = localStorage.getItem(LS_BOUNDS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeBounds(id: string, bounds: PopoutBounds): void {
  try {
    const all = readAllBounds();
    all[id] = bounds;
    localStorage.setItem(LS_BOUNDS_KEY, JSON.stringify(all));
  } catch {
    // ignore
  }
}

function getStoredBounds(id: string): PopoutBounds | undefined {
  const all = readAllBounds();
  return all[id];
}

function buildFeatures(bounds?: PopoutBounds): string {
  const width = Math.max(300, Math.floor(bounds?.width ?? 1000));
  const height = Math.max(200, Math.floor(bounds?.height ?? 700));
  const x = bounds?.x;
  const y = bounds?.y;

  const parts = [`width=${width}`, `height=${height}`, "resizable=yes", "scrollbars=yes"];

  if (typeof x === "number") parts.push(`left=${Math.floor(x)}`);
  if (typeof y === "number") parts.push(`top=${Math.floor(y)}`);

  return parts.join(",");
}

function isElectron(): boolean {
  return typeof window !== "undefined" && !!(window as any).electronAPI;
}

export function PopoutProvider({ children }: { children: React.ReactNode }) {
  const entriesRef = useRef<Map<string, PopoutEntry>>(new Map());

  const modelCacheRef = useRef<Map<string, { kind: PopoutKind; model: unknown }>>(new Map());

  const isOpen = useCallback((id: string) => {
    const popoutEntry = entriesRef.current.get(id);
    if (!popoutEntry) return false;
    if (isElectron()) return true;
    return !!popoutEntry.webWindow && !popoutEntry.webWindow.closed;
  }, []);

  const sendToPopout = useCallback((id: string, msg: PopoutMessage) => {
    const entry = entriesRef.current.get(id);
    if (!entry) return;

    if (isElectron()) {
      (window as any).electronAPI?.popoutSend?.("popout:message", msg);
      return;
    }

    const popoutWindow = entry.webWindow;
    if (!popoutWindow || popoutWindow.closed) return;
    popoutWindow.postMessage(msg, window.location.origin);
  }, []);

  const replyWithCachedModel = useCallback(
    (id: string) => {
      const cached = modelCacheRef.current.get(id);
      if (!cached) return;
      sendToPopout(id, {
        type: "POPOUT:MODEL",
        id,
        kind: cached.kind,
        model: cached.model,
      });
    },
    [sendToPopout]
  );

  const open = useCallback(
    <Kind extends PopoutKind>(req: PopoutOpenRequest<Kind>, handlers?: { onRefresh?: RefreshHandler }) => {
      const bounds = req.bounds ?? getStoredBounds(req.id);
      const entry: PopoutEntry = {
        id: req.id,
        kind: req.kind,
        title: req.title,
        ownerKey: req.ownerKey,
        refresh: handlers?.onRefresh,
        bounds,
        webWindow: null,
      };

      entriesRef.current.set(req.id, entry);

      if (isElectron()) {
        (window as any).electronAPI?.popoutOpen?.({
          id: req.id,
          title: req.title,
          kind: req.kind,
          ownerKey: req.ownerKey,
          bounds,
        });

        replyWithCachedModel(req.id);
        return;
      }

      const url = new URL(window.location.href);
      url.pathname = "/popout";
      url.searchParams.set("id", req.id);

      const win = window.open(url.toString(), `neptune_popout_${req.id}`, buildFeatures(bounds));
      entry.webWindow = win;

      if (win) {
        try {
          win.document.title = req.title;
        } catch {
          // ignore
        }
      }

      replyWithCachedModel(req.id);
    },
    [replyWithCachedModel]
  );

  const close = useCallback((id: string) => {
    const entry = entriesRef.current.get(id);
    if (!entry) return;

    if (isElectron()) {
      (window as any).electronAPI?.popoutClose?.(id);
      entriesRef.current.delete(id);
      return;
    }

    if (entry.webWindow && !entry.webWindow.closed) {
      entry.webWindow.close();
    }
    entriesRef.current.delete(id);
  }, []);

  const closeByOwner = useCallback(
    (ownerKey: string) => {
      const ids: string[] = [];
      for (const [id, e] of entriesRef.current.entries()) {
        if (e.ownerKey === ownerKey) ids.push(id);
      }
      for (const id of ids) close(id);
    },
    [close]
  );

  const updateModel = useCallback(
    <Kind extends PopoutKind>(id: string, kind: Kind, model: PopoutModelByKind[Kind]) => {
      if (!entriesRef.current.has(id)) return;

      modelCacheRef.current.set(id, { kind, model });

      sendToPopout(id, { type: "POPOUT:MODEL", id, kind, model });
    },
    [sendToPopout]
  );

  useEffect(() => {
    const onMessage = (evt: MessageEvent) => {
      if (evt.origin !== window.location.origin) return;
      const msg = evt.data as PopoutMessage;
      if (!msg || typeof msg !== "object") return;

      if (msg.type === "POPOUT:REFRESH_REQUEST") {
        const e = entriesRef.current.get(msg.id);
        e?.refresh?.();
        return;
      }

      if (msg.type === "POPOUT:BOUNDS") {
        const e = entriesRef.current.get(msg.id);
        if (e) e.bounds = msg.bounds;
        writeBounds(msg.id, msg.bounds);
        return;
      }

      if (msg.type === "POPOUT:CLOSE") {
        entriesRef.current.delete(msg.id);
        return;
      }

      if (msg.type === "POPOUT:REQUEST_MODEL") {
        replyWithCachedModel(msg.id);
        return;
      }
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [replyWithCachedModel]);

  useEffect(() => {
    if (!isElectron()) return;

    const off = (window as any).electronAPI?.popoutOn?.("popout:message", (msg: PopoutMessage) => {
      if (!msg || typeof msg !== "object") return;

      if (msg.type === "POPOUT:REFRESH_REQUEST") {
        const e = entriesRef.current.get(msg.id);
        e?.refresh?.();
        return;
      }

      if (msg.type === "POPOUT:BOUNDS") {
        const e = entriesRef.current.get(msg.id);
        if (e) e.bounds = msg.bounds;
        return;
      }

      if (msg.type === "POPOUT:CLOSE") {
        entriesRef.current.delete(msg.id);
        return;
      }

      if (msg.type === "POPOUT:REQUEST_MODEL") {
        replyWithCachedModel(msg.id);
        return;
      }
    });

    return () => {
      if (typeof off === "function") off();
    };
  }, [replyWithCachedModel]);

  const api: PopoutApi = useMemo(
    () => ({
      isOpen,
      open,
      close,
      updateModel,
      closeByOwner,
    }),
    [isOpen, open, close, updateModel, closeByOwner]
  );

  return <PopoutContext.Provider value={api}>{children}</PopoutContext.Provider>;
}

export function usePopout(): PopoutApi {
  const ctx = useContext(PopoutContext);
  if (!ctx) throw new Error(TextStore.message(30001));
  return ctx;
}
