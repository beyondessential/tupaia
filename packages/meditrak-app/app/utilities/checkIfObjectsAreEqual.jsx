// This will return true if the value of all the fields in two objects perfectly match
export const checkIfObjectsAreEqual = (a, b) => {
  return Object.entries(a).every(([key, value]) => b[key] === value);
};
