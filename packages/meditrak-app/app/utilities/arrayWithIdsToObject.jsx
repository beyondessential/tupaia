export const arrayWithIdsToObject = arrayWithIds => {
  const returnObject = {};
  arrayWithIds.forEach(object => {
    returnObject[object.id] = object;
  });
  return returnObject;
};
