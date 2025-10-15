import React, { useEffect, useRef, useState } from "react";
import {
    Modal,
    Button,
    TextInput,
    Textarea,
    Stack,
    Group,
    Grid,
    InputLabel,
} from "@mantine/core";
import { TextStore } from "../utils/TextStore";

export interface SaveAsDialogProps {
    type?: string;
    oldName?: string;
    oldDescription?: string;
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

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    useEffect(() => {
        setDesc(oldDescription ?? "");
    }, [oldDescription]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onConfirm(name.trim(), desc.trim());
    };

    return (
        <Modal
            opened
            onClose={onCancel}
            title={TextStore.interface("SaveAsDialog_Title", [type ?? ""])}
            size="lg"
            centered
            withCloseButton
            overlayProps={{ opacity: 0.45, blur: 2 }}
            trapFocus
            withinPortal
        >
            <form onSubmit={handleSubmit}>
                <Stack gap="xs">
                    <Grid columns={24} gutter="xs" align="center">
                        <Grid.Col span={7}>
                            <InputLabel htmlFor="saveas-old" size="xs">
                                {TextStore.interface("SaveAsDialog_OldName")}
                            </InputLabel>
                        </Grid.Col>
                        <Grid.Col span={17}>
                            <TextInput
                                id="saveas-old"
                                size="xs"
                                value={oldName ?? ""}
                                readOnly
                                classNames={{ input: "readonlyInput" }}
                            />
                        </Grid.Col>
                    </Grid>

                    <Grid columns={24} gutter="xs" align="center">
                        <Grid.Col span={7}>
                            <InputLabel htmlFor="saveas-name" size="xs">
                                {TextStore.interface("SaveAsDialog_Name")}
                            </InputLabel>
                        </Grid.Col>
                        <Grid.Col span={17}>
                            <TextInput
                                id="saveas-name"
                                size="xs"
                                value={name}
                                onChange={(e) => setName(e.currentTarget.value)}
                                ref={inputRef}
                                required
                                maxLength={64}
                            />
                        </Grid.Col>
                    </Grid>

                    <Grid columns={24} gutter="xs" align="start">
                        <Grid.Col span={7}>
                            <InputLabel htmlFor="saveas-desc" size="xs">
                                {TextStore.interface("SaveAsDialog_Description")}
                            </InputLabel>
                        </Grid.Col>
                        <Grid.Col span={17}>
                            <Textarea
                                id="saveas-desc"
                                rows={3}
                                maxLength={200}
                                value={desc}
                                onChange={(e) => setDesc(e.currentTarget.value)}
                                placeholder={TextStore.interface("SaveAsDialog_DescPlaceholder")}
                                size="xs"
                            />
                        </Grid.Col>
                    </Grid>

                    <Group justify="flex-end">
                        <Button variant="default" size="xs" onClick={onCancel}>
                            {TextStore.interface("SaveAsDialog_ButtonCancel")}
                        </Button>
                        <Button type="submit" size="xs" disabled={!name.trim()}>
                            {TextStore.interface("SaveAsDialog_ButtonOk")}
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    );
}
