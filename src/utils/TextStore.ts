import { getMessage } from "./MessageResources";
import { getInterfaceText } from "./InterfaceResources";

/**
 * Unified access point for UI text and user messages.
 * - TextStore.interface(key, args?) -> labels, UI strings
 * - TextStore.message(id, args?) -> status/feedback strings
 */
export const TextStore = {
  message: getMessage,
  interface: getInterfaceText,
};

export default TextStore;
