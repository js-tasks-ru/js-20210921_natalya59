export const pick = (obj, ...fields) => {
  return Object.fromEntries(Object.entries(obj).filter(([key]) => fields.includes(key)));
};
