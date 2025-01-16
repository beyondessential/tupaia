import { mapKeys, reduceToDictionary } from '@tupaia/utils';
import { DHIS2_RESOURCE_TYPES } from './types';

export const translateElementIdsToCodesInEvents = async (dhisApi, events) => {
  const ids = events.reduce(
    (allIds, event) => allIds.concat(event.dataValues.map(({ dataElement }) => dataElement)),
    [],
  );
  const dataElements = await dhisApi.getRecords({
    ids,
    fields: ['id', 'code'],
    type: DHIS2_RESOURCE_TYPES.DATA_ELEMENT,
  });
  const dataElementIdToCode = reduceToDictionary(dataElements, 'id', 'code');

  return events.map(({ dataValues, ...restOfEvent }) => ({
    ...restOfEvent,
    dataValues: dataValues.map(value => ({
      ...value,
      dataElement: dataElementIdToCode[value.dataElement],
    })),
  }));
};

export const translateElementKeysInEventAnalytics = async (
  eventAnalytics,
  dataElementKeyMapping,
) => {
  const { headers, metaData, ...otherProps } = eventAnalytics;

  const translatedHeaders = headers.map(({ name, ...otherHeaderProps }) => {
    const isDataElement = !!dataElementKeyMapping[name];
    const translatedName = isDataElement ? dataElementKeyMapping[name] : name;

    return {
      ...otherHeaderProps,
      name: translatedName,
    };
  });

  const translatedMetaData = {
    ...metaData,
    items: mapKeys(metaData.items, dataElementKeyMapping, {
      defaultToExistingKeys: true,
    }),
    dimensions: mapKeys(metaData.dimensions, dataElementKeyMapping, {
      defaultToExistingKeys: true,
    }),
  };

  return {
    headers: translatedHeaders,
    metaData: translatedMetaData,
    ...otherProps,
  };
};

export const translateMetadataInAnalytics = (
  response,
  metadataMapping,
  dimension,
  mappedValueType,
) => {
  const { metaData, rows, ...otherProps } = response;
  const dimensionIndex = response.headers.findIndex(({ name }) => name === dimension);
  const translatedRows = rows.map(row => {
    const newRow = row;
    const dimensionId = row[dimensionIndex];
    newRow[dimensionIndex] = metadataMapping[dimensionId] || dimensionId;
    return newRow;
  });
  const translatedItems = {};

  Object.entries(metaData.items).forEach(([key, item]) => {
    if (metadataMapping.hasOwnProperty(key)) {
      const newItem = mappedValueType
        ? {
            ...item,
            [mappedValueType]: metadataMapping[key],
          }
        : item;
      translatedItems[key] = newItem;
    } else {
      translatedItems[key] = item;
    }
  });

  const translatedMetaData = {
    ...metaData,
    items: translatedItems,
  };

  return {
    ...otherProps,
    metaData: translatedMetaData,
    rows: translatedRows,
  };
};
