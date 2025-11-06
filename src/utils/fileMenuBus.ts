export type FileAction = "openNew" | "openOpen" | "closeProject" | "saveProject";

type Handlers = Partial<Record<FileAction, () => void>>;
let handlers: Handlers = {};

export function registerFileMenu(partial: Handlers) {
    handlers = { ...handlers, ...partial };
}

export function invokeFileMenu(action: FileAction) {
    handlers[action]?.();
}
