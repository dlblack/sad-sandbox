import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { TextStore } from "../utils/TextStore";
import { Card, Button, TextInput, Text, Textarea } from "@mantine/core";
import "../styles/css/SaveAsDialog.css";

export interface SaveAsDialogProps {
    type: string;
    oldName: string;
    /** Optional current description to prefill the textarea */
    oldDescription?: string;
    /** Called with (newName, newDesc) when user confirms */
    onConfirm: (newName: string, newDesc?: string) => void;
    onCancel: () => void;
}

export default function SaveAsDialog({
                                         type,
                                         oldName,
                                         oldDescription,
                                         onConfirm,
                                         onCancel,
                                     }: SaveAsDialogProps) {
    const [name, setName] = useState<string>("");
    const [desc, setDesc] = useState<string>(oldDescription ?? "");
    const inputRef = useRef<HTMLInputElement | null>(null);
    const dialogRef = useRef<HTMLDivElement | null>(null);

    // lock background scroll
    useEffect(() => {
        const orig = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = orig;
        };
    }, []);

    // autofocus the name field
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    // keep desc in sync if oldDescription prop changes
    useEffect(() => {
        setDesc(oldDescription ?? "");
    }, [oldDescription]);

    const dialog = (
        <div
            className="saveas-modal-overlay"
            onMouseDown={(e) => {
                if (dialogRef.current && !dialogRef.current.contains(e.target as Node)) {
                    inputRef.current?.focus();
                }
            }}
            tabIndex={-1}
        >
            <Card
                withBorder
                radius="md"
                padding={0}
                className="saveas-dialog-card"
                role="dialog"
                aria-modal="true"
                ref={dialogRef}
                tabIndex={-1}
                style={{ maxWidth: 520, width: "90%" }}
            >
                {/* Header */}
                <div
                    className="saveas-dialog-header"
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "6px 8px",
                    }}
                >
                    <Text fw={600} size="sm">
                        {TextStore.interface("SaveAsDialog_Title", [type])}
                    </Text>
                    <Button
                        variant="subtle"
                        size="xs"
                        onClick={onCancel}
                        aria-label="Close"
                        style={{ lineHeight: 1, padding: "2px 6px" }}
                    >
                        ×
                    </Button>
                </div>

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        onConfirm(name.trim(), desc.trim());
                    }}
                >
                    <div style={{ padding: 8 }}>
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "110px 1fr",
                                gap: 8,
                                marginBottom: 8,
                            }}
                        >
                            <label style={{ fontSize: 12 }}>
                                {TextStore.interface("SaveAsDialog_OldName")}
                            </label>
                            <TextInput
                                size="xs"
                                value={oldName}
                                readOnly
                                styles={{ input: { cursor: "not-allowed" } }}
                            />
                        </div>

                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "110px 1fr",
                                gap: 8,
                                marginBottom: 8,
                            }}
                        >
                            <label style={{ fontSize: 12 }}>
                                {TextStore.interface("SaveAsDialog_Name")}
                            </label>
                            <TextInput
                                size="xs"
                                value={name}
                                onChange={(e) => setName(e.currentTarget.value)}
                                ref={inputRef}
                                required
                                maxLength={64}
                                placeholder="Enter new name"
                            />
                        </div>

                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "110px 1fr",
                                gap: 8,
                                marginBottom: 8,
                            }}
                        >
                            <label style={{ fontSize: 12 }}>
                                {TextStore.interface("SaveAsDialog_Description")}
                            </label>
                            <Textarea
                                rows={3}
                                maxLength={200}
                                value={desc}
                                onChange={(e) => setDesc(e.currentTarget.value)}
                                placeholder="Enter description"
                                size="xs"
                            />
                        </div>
                    </div>

                    <div className="saveas-dialog-footer">
                        <div
                            className="saveas-dialog-footer-inner"
                            style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}
                        >
                            <Button variant="outline" size="xs" onClick={onCancel}>
                                {TextStore.interface("SaveAsDialog_ButtonCancel")}
                            </Button>
                            <Button
                                variant="filled"
                                size="xs"
                                type="submit"
                                disabled={!name.trim()}
                            >
                                {TextStore.interface("SaveAsDialog_ButtonOk")}
                            </Button>
                        </div>
                    </div>
                </form>
            </Card>
        </div>
    );

    return ReactDOM.createPortal(dialog, document.body);
}
