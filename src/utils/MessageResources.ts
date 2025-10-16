/**
 * Plain text resources for user feedback / status updates.
 * Use placeholders {0}, {1}, ... for simple string interpolation.
 */
export const TEXT_MESSAGES = {
  10001: "Opened {0} {1}.",
  10002: "Created {0} \"{1}\".",
  10003: "Something went wrong.",
  10010: "{0} is already open.",
  10020: "Deleted \"{0}\".",
  10030: "Closed {0} {1}.",

  20001: "Opened {0} {1}.",
  20002: "Created {0} \"{1}\".",
  20003: "Something went wrong.",
  20010: "{0} is already open.",
  20020: "Deleted \"{0}\".",
  20030: "Closed {0} {1}.",
} as const;

export type MessageKey = keyof typeof TEXT_MESSAGES;

/**
 * Resolve a message by id and replace {0}, {1}, ... with args.
 * Falls back to the id itself if no template exists.
 */
export function getMessage(id: MessageKey | number | string, args: unknown[] = []): string {
  const key = String(id);
  const template =
      (TEXT_MESSAGES as unknown as Record<string, string>)[key] ?? key;

  const arr = Array.isArray(args) ? args : (args == null ? [] : [args]);

  let out = template;
  arr.forEach((arg, i) => {
    out = out.replace(new RegExp(`\\{${i}\\}`, "g"), String(arg ?? ""));
  });

  return out;
}
