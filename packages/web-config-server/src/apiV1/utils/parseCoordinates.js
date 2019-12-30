export const parseCoordinates = coordinateString => {
  if (!coordinateString) return [];
  if (Array.isArray(coordinateString)) return coordinateString;

  try {
    return JSON.parse(coordinateString);
  } catch (e) {
    return [];
  }
};
