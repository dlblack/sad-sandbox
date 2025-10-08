export default function isElectron(): boolean {
  const g = globalThis as any;

  // Electron renderer process
  if (g?.window && g?.process?.type === "renderer") {
    return true;
  }

  // Main or renderer (process.versions.electron exists)
  if (g?.process?.versions?.electron) {
    return true;
  }

  // User agent check (fallback)
  const ua: string | undefined = g?.navigator?.userAgent;
  return !!(typeof ua === "string" && /Electron/i.test(ua));
}
