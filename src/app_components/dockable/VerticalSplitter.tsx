import React from "react";
import { Box } from "@mantine/core";

type Props = {
    onMouseDown: React.MouseEventHandler<HTMLDivElement>;
    "aria-label"?: string;
};
export default function VerticalSplitter(props: Props) {
    return <Box className="dock-splitter-vertical" role="separator" tabIndex={0} {...props} />;
}