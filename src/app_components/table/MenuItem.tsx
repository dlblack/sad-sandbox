import React from "react";
import { useMantineColorScheme } from "@mantine/core";

interface MenuItemProps {
    onClick?: () => void;
    disabled?: boolean;
    children: React.ReactNode;
}

export default function MenuItem({ onClick, disabled, children }: MenuItemProps) {
    const [hovered, setHovered] = React.useState(false);
    const { colorScheme } = useMantineColorScheme();

    const hoverColor =
        colorScheme === "dark"
            ? "var(--mantine-color-dark-4)"
            : "var(--mantine-color-gray-1)";

    return (
        <button
            type="button"
            onClick={disabled ? undefined : onClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                all: "unset",
                padding: "4px 10px",
                cursor: disabled ? "default" : "pointer",
                fontSize: 12,
                lineHeight: 1.3,
                color: "inherit",
                display: "block",
                width: "100%",
                opacity: disabled ? 0.5 : 1,
                background: hovered && !disabled ? hoverColor : "transparent",
            }}
        >
            {children}
        </button>
    );
}
