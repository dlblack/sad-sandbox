import React, { useCallback, useRef, useState } from "react";
import { Box } from "@mantine/core";
import { DockableFrameProps, ZoneSize } from "./DockTypes";
import ZoneWest from "./ZoneWest";
import ZoneCenter from "./ZoneCenter";
import ZoneEast from "./ZoneEast";
import ZoneSouth from "./ZoneSouth";
import VerticalSplitter from "./VerticalSplitter";
import HorizontalSplitter from "./HorizontalSplitter";
import "../../styles/css/DockableFrame.css";

const DEFAULTS = {
    W: 360,
    E: 100,
    S: 200,
    MIN_W: 50,
    MAX_W: 800,
    MIN_E: 50,
    MAX_E: 1000,
    MIN_S: 120,
};

export default function DockableFrame(props: DockableFrameProps) {
    const {
        centerContent,
        westContent,
        eastContent,
        southContent,
        initialWestWidth = DEFAULTS.W,
        initialEastWidth = DEFAULTS.E,
        initialSouthHeight = DEFAULTS.S,
        minWestWidth = DEFAULTS.MIN_W,
        minEastWidth = DEFAULTS.MIN_E,
        minSouthHeight = DEFAULTS.MIN_S,
    } = props;

    const frameRef = useRef<HTMLDivElement | null>(null);
    const rowRef = useRef<HTMLDivElement | null>(null);

    const [zoneWidths, setZoneWidths] = useState<ZoneSize>({ W: initialWestWidth, E: initialEastWidth });
    const [southHeight, setSouthHeight] = useState<number>(initialSouthHeight);

    // ---- dragging state -------------------------------------------------
    const dragRef = useRef<{
        kind: "vertical" | "horizontal" | null;
        zone: "W" | "E" | "S" | null;
        startX: number;
        startY: number;
        startWidth: number;
        startHeight: number;
    }>({ kind: null, zone: null, startX: 0, startY: 0, startWidth: 0, startHeight: 0 });

    // ---- helpers --------------------------------------------------------
    const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(v, max));

    const getRowInnerWidth = useCallback(() => {
        const el = rowRef.current;
        if (!el) return 0;
        return el.clientWidth;
    }, []);

    // ---- vertical splitter handlers (W/E) -------------------------------
    const onVerticalDown = useCallback(
        (zone: "W" | "E") => (e: React.MouseEvent) => {
            dragRef.current = {
                kind: "vertical",
                zone,
                startX: e.clientX,
                startY: 0,
                startWidth: zone === "W" ? zoneWidths.W : zoneWidths.E,
                startHeight: 0,
            };
            document.body.style.cursor = "col-resize";
            window.addEventListener("mousemove", onVerticalMove);
            window.addEventListener("mouseup", onVerticalUp);
        },
        [zoneWidths.W, zoneWidths.E]
    );

    const onVerticalMove = useCallback((e: MouseEvent) => {
        const d = dragRef.current;
        if (d.kind !== "vertical" || (d.zone !== "W" && d.zone !== "E")) return;

        const dx = e.clientX - d.startX;
        const total = getRowInnerWidth(); // Total width of the container

        const maxWest = total - (zoneWidths.E + 8 + 240);
        const maxEast = total - (zoneWidths.W + 8 + 320);

        if (d.zone === "W") {
            const next = clamp(d.startWidth + dx, minWestWidth, Math.max(minWestWidth, Math.min(maxWest, DEFAULTS.MAX_W)));
            setZoneWidths((prev) => ({ ...prev, W: next }));
        } else if (d.zone === "E") {
            const next = clamp(d.startWidth - dx, minEastWidth, Math.max(minEastWidth, Math.min(maxEast, DEFAULTS.MAX_E)));
            setZoneWidths((prev) => ({ ...prev, E: next }));
        }
    }, [getRowInnerWidth, minWestWidth, minEastWidth, zoneWidths.E, zoneWidths.W]);

    const onVerticalUp = useCallback(() => {
        document.body.style.cursor = "";
        dragRef.current = { kind: null, zone: null, startX: 0, startY: 0, startWidth: 0, startHeight: 0 };
        window.removeEventListener("mousemove", onVerticalMove);
        window.removeEventListener("mouseup", onVerticalUp);
    }, [onVerticalMove]);

    // ---- horizontal splitter handlers (S) -------------------------------
    const onHorizontalDown = useCallback((e: React.MouseEvent) => {
        dragRef.current = {
            kind: "horizontal",
            zone: "S",
            startX: 0,
            startY: e.clientY,
            startWidth: 0,
            startHeight: southHeight,
        };
        document.body.style.cursor = "row-resize";
        window.addEventListener("mousemove", onHorizontalMove);
        window.addEventListener("mouseup", onHorizontalUp);
    }, [southHeight]);

    const onHorizontalMove = useCallback((e: MouseEvent) => {
        const d = dragRef.current;
        if (d.kind !== "horizontal" || d.zone !== "S") return;
        const dy = e.clientY - d.startY;

        const frame = frameRef.current;
        const max = frame ? frame.clientHeight - 140 : d.startHeight; // leave space for row & headers
        const next = clamp(d.startHeight - dy, minSouthHeight, Math.max(minSouthHeight, max));
        setSouthHeight(next);
    }, [minSouthHeight]);

    const onHorizontalUp = useCallback(() => {
        document.body.style.cursor = "";
        dragRef.current = { kind: null, zone: null, startX: 0, startWidth: 0, startY: 0, startHeight: 0 };
        window.removeEventListener("mousemove", onHorizontalMove);
        window.removeEventListener("mouseup", onHorizontalUp);
    }, [onHorizontalMove]);

    // ---- render ---------------------------------------------------------
    return (
        <Box ref={frameRef} className="dockable-frame">
            <Box ref={rowRef} className="dockable-frame-row">
                <ZoneWest width={zoneWidths.W}>{westContent}</ZoneWest>
                <VerticalSplitter aria-label="Resize west" onMouseDown={onVerticalDown("W")} />
                <ZoneCenter>{centerContent}</ZoneCenter>
                <VerticalSplitter aria-label="Resize east" onMouseDown={onVerticalDown("E")} />
                <ZoneEast width={zoneWidths.E}>{eastContent}</ZoneEast>
            </Box>

            <HorizontalSplitter aria-label="Resize south" onMouseDown={onHorizontalDown} />
            <ZoneSouth height={southHeight}>{southContent}</ZoneSouth>
        </Box>
    );
}
