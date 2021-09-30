export const omit = (obj, ...fields) => {
  return Object.fromEntries(Object.entries(obj).filter(([key]) => !fields.includes(key)));
};
