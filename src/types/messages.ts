import { makeMessage } from "../utils/messageUtils";

export type AppMessage = ReturnType<typeof makeMessage>;

export type AppMessageType = "info" | "success" | "warning" | "danger";
