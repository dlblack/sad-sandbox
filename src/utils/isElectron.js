export default function isElectron() {

  if (typeof window !== 'undefined' && window.process && window.process.type === 'renderer') {
    return true;
  }

  if (typeof process !== 'undefined' && process.versions && !!process.versions.electron) {
    return true;
  }

  if (typeof navigator === 'object' && navigator.userAgent.includes('Electron')) {
    return true;
  }
  return false;
}
