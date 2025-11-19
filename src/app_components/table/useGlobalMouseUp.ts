import { useEffect } from "react";

export function useGlobalMouseUp(
    isMouseDown: boolean,
    onFinish: () => void
): void {
    useEffect(() => {
        function handleGlobalMouseUp() {
            if (isMouseDown) {
                onFinish();
            }
        }
        window.addEventListener("mouseup", handleGlobalMouseUp);
        return () => window.removeEventListener("mouseup", handleGlobalMouseUp);
    }, [isMouseDown, onFinish]);
}
