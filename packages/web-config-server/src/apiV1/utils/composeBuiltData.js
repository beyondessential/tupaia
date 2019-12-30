export const composeBuiltData = (...builtDataResponses) => {
  let returnObject = {
    data: [],
  };
  builtDataResponses.forEach(({ data, ...metaData }) => {
    const { data: currentData, ...restOfReturnObject } = returnObject;
    returnObject = {
      ...restOfReturnObject,
      ...metaData,
      data: [...currentData, ...data],
    };
  });
  return returnObject;
};
