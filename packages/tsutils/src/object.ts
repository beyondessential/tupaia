// handle optional fields in objectEntries
export const objectEntries = <T extends Record<string, unknown>>(o: T) => {
  return Object.entries(o) as [keyof T, T[keyof T]][];
};

export const objectKeys = <T extends Record<string, unknown>>(o: T) => {
  return Object.keys(o) as (keyof T)[];
};
