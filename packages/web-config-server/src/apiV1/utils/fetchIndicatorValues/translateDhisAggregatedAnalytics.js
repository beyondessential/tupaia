// TODO: The code in this file is to implement a hacky approach to fetch indicator values
// because the normal analytics/rawData.json endpoint does not return any data for indicators.
// Will have to implement this properly with #tupaia-backlog/issues/2412
// After that remove this file and anything related to it

import { mapKeys } from '@tupaia/utils';

export const translateElementInDhisAggregatedAnalytics = (
  response,
  dimensionKeyMapping,
  dimension,
) => {
  const { metaData, rows, ...otherProps } = response;
  const { dimensions } = metaData;
  const dxIndex = response.headers.findIndex(({ name }) => name === dimension);

  const translatedDimension = dimensions.dx.map(d => dimensionKeyMapping[d] || d);
  const translatedRows = rows.map(row => {
    const newRow = row;
    const dxId = row[dxIndex];
    newRow[dxIndex] = dimensionKeyMapping[dxId] || dxId;
    return newRow;
  });

  const translatedMetaData = {
    ...metaData,
    items: mapKeys(metaData.items, dimensionKeyMapping, {
      defaultToExistingKeys: true,
    }),
    dimensions: {
      ...dimensions,
      [dimension]: translatedDimension,
    },
  };

  return {
    ...otherProps,
    metaData: translatedMetaData,
    rows: translatedRows,
  };
};
