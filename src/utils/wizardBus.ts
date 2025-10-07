type OpenPayload = { kind: string; props?: unknown };
type Unsub = () => void;

class WizardBus {
  private listeners = new Set<(p: OpenPayload) => void>();

  onOpen(cb: (p: OpenPayload) => void): Unsub {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  open(kind: string, props?: unknown): void {
    const payload = { kind, props };
    this.listeners.forEach((cb) => cb(payload));
  }
}

export const wizardBus = new WizardBus();
export const openWizard = (kind: string, props?: unknown) => wizardBus.open(kind, props);
