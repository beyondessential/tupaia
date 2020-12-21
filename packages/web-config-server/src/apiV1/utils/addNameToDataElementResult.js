export const addNameToDataElementResult = (results, dataElementCodeToName, labels = {}) => {
  const dataElementsWithName = results.map(({ dataElement: dataElementCode, ...result }) => {
    const name = labels[dataElementCode] || dataElementCodeToName[dataElementCode];
    return {
      ...result,
      dataElementCode,
      name,
    };
  });
  return dataElementsWithName;
};
