import React from "react";
import { TextStore } from "../../../utils/TextStore";
import { Card, TextInput, Text } from "@mantine/core";

type PartKey = "A" | "B" | "C" | "D" | "E" | "F";

export interface TimeseriesPathnameStepProps {
    /** Path parts keyed by literal letters A–F (NOT localized labels) */
    pathnameParts: Record<PartKey, string>;
    /** Replaces the entire parts object (immutably set) */
    setPathnameParts: (next: Record<PartKey, string>) => void;
    /**
     * Optional flags to control which parts are editable.
     * Omitted keys default to false (readonly) unless you specify otherwise.
     */
    editableParts?: Partial<Record<PartKey, boolean>>;
}

export default function TimeseriesPathnameStep({
                                                   pathnameParts,
                                                   setPathnameParts,
                                                   editableParts,
                                               }: TimeseriesPathnameStepProps) {
    const labels = {
        A: TextStore.interface("ManualDataEntryEditor_TimeseriesPathname_A"),
        B: TextStore.interface("ManualDataEntryEditor_TimeseriesPathname_B"),
        C: TextStore.interface("ManualDataEntryEditor_TimeseriesPathname_C"),
        D: TextStore.interface("ManualDataEntryEditor_TimeseriesPathname_D"),
        E: TextStore.interface("ManualDataEntryEditor_TimeseriesPathname_E"),
        F: TextStore.interface("ManualDataEntryEditor_TimeseriesPathname_F"),
    };

    // default editability (C/D/E readonly by default, others editable)
    const canEdit: Record<PartKey, boolean> = {
        A: editableParts?.A ?? true,
        B: editableParts?.B ?? true,
        C: editableParts?.C ?? false,
        D: editableParts?.D ?? false,
        E: editableParts?.E ?? false,
        F: editableParts?.F ?? true,
    };

    function handlePartChange(part: PartKey, val: string) {
        setPathnameParts({ ...pathnameParts, [part]: val });
    }

    const preview = `/${["A", "B", "C", "D", "E", "F"]
        .map((k) => pathnameParts[k as PartKey] || "")
        .join("/")}/`;

    return (
        <div>
            <Card withBorder radius="md" padding="xs" style={{ width: "100%" }}>
                {/* Row 1: A, B, C */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "auto 1fr auto 1fr auto 1fr",
                        gap: 8,
                        marginBottom: 8,
                        alignItems: "center",
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                    }}
                >
                    {/* A */}
                    <Text size="xs" style={{ minWidth: 16 }}>
                        {labels.A}
                    </Text>
                    <TextInput
                        size="xs"
                        value={pathnameParts.A || ""}
                        onChange={(e) => handlePartChange("A", e.currentTarget.value)}
                        maxLength={50}
                        readOnly={!canEdit.A}
                        tabIndex={canEdit.A ? 0 : -1}
                        style={!canEdit.A ? { backgroundColor: "#f9f9f9" } : undefined}
                    />

                    {/* B */}
                    <Text size="xs" style={{ minWidth: 16 }}>
                        {labels.B}
                    </Text>
                    <TextInput
                        size="xs"
                        value={pathnameParts.B || ""}
                        onChange={(e) => handlePartChange("B", e.currentTarget.value)}
                        maxLength={50}
                        readOnly={!canEdit.B}
                        tabIndex={canEdit.B ? 0 : -1}
                        style={!canEdit.B ? { backgroundColor: "#f9f9f9" } : undefined}
                    />

                    {/* C */}
                    <Text size="xs" style={{ minWidth: 16 }}>
                        {labels.C}
                    </Text>
                    <TextInput
                        size="xs"
                        value={pathnameParts.C || ""}
                        onChange={(e) => handlePartChange("C", e.currentTarget.value)}
                        maxLength={50}
                        readOnly={!canEdit.C}
                        tabIndex={canEdit.C ? 0 : -1}
                        style={!canEdit.C ? { backgroundColor: "#f9f9f9" } : undefined}
                    />
                </div>

                {/* Row 2: D, E, F */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "auto 1fr auto 1fr auto 1fr",
                        gap: 8,
                        marginBottom: 8,
                        alignItems: "center",
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                    }}
                >
                    {/* D */}
                    <Text size="xs" style={{ minWidth: 16 }}>
                        {labels.D}
                    </Text>
                    <TextInput
                        size="xs"
                        value={pathnameParts.D || ""}
                        onChange={(e) => handlePartChange("D", e.currentTarget.value)}
                        maxLength={50}
                        readOnly={!canEdit.D}
                        tabIndex={canEdit.D ? 0 : -1}
                        style={!canEdit.D ? { backgroundColor: "#f9f9f9" } : undefined}
                    />

                    {/* E */}
                    <Text size="xs" style={{ minWidth: 16 }}>
                        {labels.E}
                    </Text>
                    <TextInput
                        size="xs"
                        value={pathnameParts.E || ""}
                        onChange={(e) => handlePartChange("E", e.currentTarget.value)}
                        maxLength={50}
                        readOnly={!canEdit.E}
                        tabIndex={canEdit.E ? 0 : -1}
                        style={!canEdit.E ? { backgroundColor: "#f9f9f9" } : undefined}
                    />

                    {/* F */}
                    <Text size="xs" style={{ minWidth: 16 }}>
                        {labels.F}
                    </Text>
                    <TextInput
                        size="xs"
                        value={pathnameParts.F || ""}
                        onChange={(e) => handlePartChange("F", e.currentTarget.value)}
                        maxLength={50}
                        readOnly={!canEdit.F}
                        tabIndex={canEdit.F ? 0 : -1}
                        style={!canEdit.F ? { backgroundColor: "#f9f9f9" } : undefined}
                    />
                </div>

                {/* Preview */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "auto 1fr",
                        gap: 8,
                        alignItems: "center",
                        width: "100%",
                    }}
                >
                    <Text size="xs" style={{ minWidth: 70 }}>
                        {TextStore.interface("ManualDataEntryEditor_Pathname") || "Pathname"}
                    </Text>
                    <TextInput size="xs" value={preview} readOnly />
                </div>
            </Card>
        </div>
    );
}
