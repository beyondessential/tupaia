/**
 * @param {array of Object<name, value>} data e.g. [ { name: A, value: 1 }, { name: B, value: 2 } ]
 * @param seriesConfig
 * @returns {array of Object<name, ...>} e.g. [ { name: 'Age', A: 1, B: 2 } ]
 */
export const flatToSeries = (data, seriesConfig) => {
  const transformedAsObj = {};

  Object.entries(seriesConfig).forEach(([seriesLabel, values]) => {
    Object.entries(values).forEach(([itemLabel, dataElementCode]) => {
      if (!transformedAsObj[itemLabel]) {
        transformedAsObj[itemLabel] = {
          name: itemLabel,
        };
      }

      transformedAsObj[itemLabel][seriesLabel] = data.find(i => i.name === dataElementCode).value;
    });
  });

  return Object.values(transformedAsObj);
};
