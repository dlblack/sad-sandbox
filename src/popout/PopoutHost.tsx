import React, { useEffect, useMemo, useState } from "react";
import { Button, Group, Stack } from "@mantine/core";
import Chart from "../app_components/plots/Chart";
import type { PlotModel, PopoutMessage, PopoutBounds } from "./popoutTypes";
import TextStore from "../utils/TextStore";

function isElectron(): boolean {
  return typeof window !== "undefined" && !!(window as any).electronAPI;
}

function readId(): string {
  const url = new URL(window.location.href);
  return url.searchParams.get("id") ?? "";
}

function getBounds(): PopoutBounds {
  try {
    return {
      x: window.screenX,
      y: window.screenY,
      width: window.outerWidth,
      height: window.outerHeight,
    };
  } catch {
    return {};
  }
}

export default function PopoutHost() {
  const id = useMemo(() => readId(), []);
  const [plot, setPlot] = useState<PlotModel | null>(null);

  const send = (msg: PopoutMessage) => {
    if (isElectron()) {
      (window as any).electronAPI?.popoutSend?.("popout:message", msg);
      return;
    }
    window.opener?.postMessage(msg, window.location.origin);
  };

  useEffect(() => {
    if (!id) return;

    if (isElectron()) {
      const off = (window as any).electronAPI?.popoutOn?.("popout:message", (msg: PopoutMessage) => {
        if (msg?.type === "POPOUT:MODEL" && msg.id === id && msg.kind === "plot") {
          setPlot(msg.model as PlotModel);
        }
      });

      (async () => {
        const initial = await (window as any).electronAPI?.popoutGetModel?.(id);
        if (initial) setPlot(initial as PlotModel);
      })();

      return () => {
        if (typeof off === "function") off();
      };
    }

    const onMessage = (evt: MessageEvent) => {
      if (evt.origin !== window.location.origin) return;
      const msg = evt.data as PopoutMessage;
      if (msg?.type === "POPOUT:MODEL" && msg.id === id && msg.kind === "plot") {
        setPlot(msg.model as PlotModel);
      }
    };

    window.addEventListener("message", onMessage);

    send({ type: "POPOUT:REQUEST_MODEL", id });

    return () => window.removeEventListener("message", onMessage);
  }, [id]);

  useEffect(() => {
    if (!id) return;

    const pushBounds = () => send({ type: "POPOUT:BOUNDS", id, bounds: getBounds() });

    const onBeforeUnload = () => {
      pushBounds();
      send({ type: "POPOUT:CLOSE", id });
    };

    window.addEventListener("resize", pushBounds);
    window.addEventListener("beforeunload", onBeforeUnload);

    const t = window.setInterval(pushBounds, 2000);

    return () => {
      window.clearInterval(t);
      window.removeEventListener("resize", pushBounds);
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  }, [id]);

  const requestRefresh = () => send({ type: "POPOUT:REFRESH_REQUEST", id });

  return (
    <div className="popoutHost">
      <Stack gap="xs" className="popoutHostStack">
        <Group justify="space-between" className="popoutHostheader">
          <div className="popoutHostTitle">{plot?.title ?? TextStore.interface("PLOT_L")}</div>
          <Group gap="xs">
            <Button
              size="xs"
              onClick={requestRefresh}
            >
              {TextStore.interface("REFRESH_B")}
            </Button>
            <Button
              size="xs"
              variant="default"
              onClick={() => window.close()}
            >
              {TextStore.interface("CLOSE_B")}
            </Button>
          </Group>
        </Group>

        <div className="popoutHostBody">
          {plot ? (
            <Chart key={plot.plotKey} data={plot.plotData as any} layout={plot.layout as any} />
          ) : (
            <div className="popoutHostWaiting">{TextStore.interface("WAITING_L")}</div>
          )}
        </div>
      </Stack>
    </div>
  );
}
