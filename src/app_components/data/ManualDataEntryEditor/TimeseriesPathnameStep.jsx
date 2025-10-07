import React from "react";
import { TextStore } from "../../../utils/TextStore";
import { Card, TextInput, Text } from "@mantine/core";

export default function TimeseriesPathnameStep({ pathnameParts, setPathnameParts }) {
  function handlePartChange(part, val) {
    setPathnameParts({ ...pathnameParts, [part]: val });
  }

  const A = TextStore.interface("ManualDataEntryEditor_TimeseriesPathname_A");
  const B = TextStore.interface("ManualDataEntryEditor_TimeseriesPathname_B");
  const C = TextStore.interface("ManualDataEntryEditor_TimeseriesPathname_C");
  const D = TextStore.interface("ManualDataEntryEditor_TimeseriesPathname_D");
  const E = TextStore.interface("ManualDataEntryEditor_TimeseriesPathname_E");
  const F = TextStore.interface("ManualDataEntryEditor_TimeseriesPathname_F");

  const preview = `/${[A, B, C, D, E, F].map((p) => pathnameParts[p] || "").join("/")}/`;

  return (
    <div>
      <Text size="lg" fw={600} mb="xs">
        Define DSS Pathname Parts
      </Text>

      <Card withBorder radius="md" padding="xs" style={{ width: "100%" }}>
        <Text size="xs" c="dimmed" mb={6}>
          Pathname Parts
        </Text>

        {/* Row 1: A, B, C (C read-only) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "auto 1fr auto 1fr auto 1fr",
            gap: 8,
            marginBottom: 8,
            alignItems: "center",
            overflow: "hidden",
            whiteSpace: "nowrap"
          }}
        >
          {/* A */}
          <Text size="xs" style={{ minWidth: 16 }}>
            {A}
          </Text>
          <TextInput
            size="xs"
            value={pathnameParts[A] || ""}
            onChange={(e) => handlePartChange(A, e.target.value)}
            maxLength={50}
          />

          {/* B */}
          <Text size="xs" style={{ minWidth: 16 }}>
            {B}
          </Text>
          <TextInput
            size="xs"
            value={pathnameParts[B] || ""}
            onChange={(e) => handlePartChange(B, e.target.value)}
            maxLength={50}
          />

          {/* C (read-only) */}
          <Text size="xs" style={{ minWidth: 16 }}>
            {C}
          </Text>
          <TextInput
            size="xs"
            value={pathnameParts[C] || ""}
            readOnly
            tabIndex={-1}
            style={{ backgroundColor: "#f9f9f9" }}
            maxLength={50}
          />
        </div>

        {/* Row 2: D, E, F (F editable) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "auto 1fr auto 1fr auto 1fr",
            gap: 8,
            marginBottom: 8,
            alignItems: "center",
            overflow: "hidden",
            whiteSpace: "nowrap"
          }}
        >
          {/* D (read-only) */}
          <Text size="xs" style={{ minWidth: 16 }}>
            {D}
          </Text>
          <TextInput
            size="xs"
            value={pathnameParts[D] || ""}
            readOnly
            tabIndex={-1}
            style={{ backgroundColor: "#f9f9f9" }}
            maxLength={50}
          />

          {/* E (read-only) */}
          <Text size="xs" style={{ minWidth: 16 }}>
            {E}
          </Text>
          <TextInput
            size="xs"
            value={pathnameParts[E] || ""}
            readOnly
            tabIndex={-1}
            style={{ backgroundColor: "#f9f9f9" }}
            maxLength={50}
          />

          {/* F (editable) */}
          <Text size="xs" style={{ minWidth: 16 }}>
            {F}
          </Text>
          <TextInput
            size="xs"
            value={pathnameParts[F] || ""}
            onChange={(e) => handlePartChange(F, e.target.value)}
            maxLength={50}
          />
        </div>

        {/* Preview */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "auto 1fr",
            gap: 8,
            alignItems: "center",
            width: "100%"
          }}
        >
          <Text size="xs" style={{ minWidth: 70 }}>
            {TextStore.interface("ManualDataEntryEditor_Pathname")}
          </Text>
          <TextInput size="xs" value={preview} readOnly />
        </div>
      </Card>
    </div>
  );
}
