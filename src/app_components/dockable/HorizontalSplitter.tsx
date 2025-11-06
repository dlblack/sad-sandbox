import React from "react";
import { Box } from "@mantine/core";

type Props = {
    onMouseDown: React.MouseEventHandler<HTMLDivElement>;
    "aria-label"?: string;
};
export default function HorizontalSplitter(props: Props) {
    return <Box className="dock-splitter-horizontal" role="separator" tabIndex={0} {...props} />;
}