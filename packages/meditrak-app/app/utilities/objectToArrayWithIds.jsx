export const objectToArrayWithIds = object =>
  Object.entries(object).map(([key, value]) => ({
    id: key,
    ...value,
  }));
