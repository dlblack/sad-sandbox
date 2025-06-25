export function addEphemeralKeys(array, type) {
  return array.map((item, idx) => ({
    ...item,
    __tempKey: `${type}-${idx}-${Math.random().toString(36).slice(2)}`
  }));
}
