export function invertObj(obj) {
  if (!obj) return undefined;
  const objMap = Object.entries(obj);
  return objMap.length === 0 ? {} : Object.fromEntries(objMap.map(([key, value]) => [value, key]));
}
