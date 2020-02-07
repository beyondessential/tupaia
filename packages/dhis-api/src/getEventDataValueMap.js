export const getEventDataValueMap = event =>
  event.dataValues.reduce((dataValueMap, dataValue) => {
    return { ...dataValueMap, [dataValue.dataElement]: dataValue };
  }, {});
