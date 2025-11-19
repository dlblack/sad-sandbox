export function logSilentError(err: unknown, context?: string) {
    if (process.env.NODE_ENV !== 'development') {
        console.warn(context ?? "silent error:", err);
    }
}