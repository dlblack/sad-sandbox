const TEXT_MESSAGES = {
  10001: "Opened new {0} {1}.",
  10002: "Created {0} \"{1}\".",
  10003: "Something went wrong.",
  10010: "{0} is already open.",
  10020: "Deleted \"{0}\".",
  10030: "Closed {0} {1}.",

  20001: "Opened new {0} {1}.",
  20002: "Created {0} \"{1}\".",
  20003: "Something went wrong.",
  20010: "{0} is already open.",
  20020: "Deleted \"{0}\".",
  20030: "Closed {0} {1}.",
};

export function getText(id, args = []) {
  let template = TEXT_MESSAGES[id] || id;
  args.forEach((arg, i) => {
    template = typeof template === "string"
      ? template.replace(new RegExp(`\\{${i}\\}`, "g"), arg ?? "")
      : template;
  });
  return template;
}
