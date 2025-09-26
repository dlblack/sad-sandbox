class WizardBus {
  constructor() { this.listeners = new Set(); }
  onOpen(fn) { this.listeners.add(fn); return () => this.listeners.delete(fn); }
  emitOpen(payload) { for (const fn of this.listeners) { try { fn(payload); } catch {} } }
}
export const wizardBus = new WizardBus();

export function openWizard(kind, props = {}) {
  wizardBus.emitOpen({ kind, props });
}
