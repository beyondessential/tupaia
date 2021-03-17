/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

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

export const translateElementsKeysAndCodeInAnalytics = async (analytics, dataElementKeyMapping) => {
  const { headers, metaData, ...otherProps } = analytics;

  const translatedHeaders = headers.map(({ name, ...otherHeaderProps }) => {
    const isDataElement = !!dataElementKeyMapping[name];
    const translatedName = isDataElement ? dataElementKeyMapping[name] : name;

    return {
      ...otherHeaderProps,
      name: translatedName,
    };
  });

  // Need to also change the code Analytics
  const { items } = metaData;
  Object.keys(items).forEach(key => {
    items[key].code = dataElementKeyMapping[key] ?? items[key].code;
  });

  const translatedMetaData = {
    ...metaData,
    items: mapKeys(items, dataElementKeyMapping, {
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
