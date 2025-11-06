import {getAlertText} from "./AlertResources";
import { getInterfaceText } from "./InterfaceResources";
import { getMessage } from "./MessageResources";

/**
 * Unified access point for UI text and user messages.
 * - TextStore.alert(key, args?) -> alert messages
 * - TextStore.interface(key, args?) -> labels, UI strings
 * - TextStore.message(id, args?) -> status/feedback strings
 */
export const TextStore = {
  alert: getAlertText,
  interface: getInterfaceText,
  message: getMessage,
};

export default TextStore;
