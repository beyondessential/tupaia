export function getArrayQueryParameter(value) {
  if (Array.isArray(value)) return value;
  // wrap a single value in an array, unless it's null or undefined
  return value || value === 0 ? [value] : value;
}
