/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { keyBy, uniq } from 'lodash';
import moment from 'moment';

import { compareAsc, hasIntersection, readJsonFile, toArray, yup, yupUtils } from '@tupaia/utils';
import { convertDateRangeToUrlPeriodString } from '../../../src/historyNavigation/utils';

export const VIZ_TYPES = {
  DASHBOARD_REPORT: 'dashboardReport',
  MAP_OVERLAY: 'mapOverlay',
};

const VIZ_TYPE_CONFIG = {
  [VIZ_TYPES.DASHBOARD_REPORT]: {
    name: 'Dashboard report',
    key: 'code',
  },
  [VIZ_TYPES.MAP_OVERLAY]: {
    name: 'Map overlay',
    key: 'id',
  },
};

export const buildUrlsUsingConfig = async config => {
  const { urlFiles = [], urls = [] } = config;
  const urlsFromFiles = urlFiles.map(readJsonFile).flat();
  return [...urlsFromFiles, ...urls];
};

export const sortUrls = urls => uniq(urls).sort(compareAsc);

const { polymorphic, testSync } = yupUtils;

export const buildUrlSchema = ({ regex, regexDescription, shape }) =>
  polymorphic({
    string: yup
      .string()
      .matches(
        regex,
        `url "$\{value}" is not valid, must use the following format: ${regexDescription}`,
      ),
    object: testSync(
      yup.object(shape),
      ({ value, error }) =>
        `invalid url\n${JSON.stringify(value, undefined, 2)}\ncausing message "${error.message}"`,
    ),
  });

export const buildVizPeriod = (startDate, endDate) => {
  if (!startDate || !endDate) {
    return undefined;
  }
  return convertDateRangeToUrlPeriodString({
    startDate: moment(startDate),
    endDate: moment(endDate),
  });
};

export const filterObjectUrls = (objectUrls, filter, vizType) => {
  if (Object.keys(filter).length === 0) {
    return objectUrls;
  }

  const { key, name: vizTypeName } = VIZ_TYPE_CONFIG[vizType];
  const objectUrlsByKey = keyBy(objectUrls, key);

  const filterUrl = url =>
    Object.entries(filter).some(([filterKey, targetValue]) => {
      const objectUrl = objectUrlsByKey[url[key]];
      if (!objectUrl) {
        throw new Error(`${vizTypeName} with ${key} "${url[key]}" was not found in the database`);
      }

      // skip all urls that do not have the filter key
      if (objectUrl[filterKey] === undefined || objectUrl[filterKey] === null) {
        return false;
      }

      const value = url[filterKey];
      return hasIntersection(toArray(targetValue), toArray(value));
    });

  return objectUrls.filter(filterUrl);
};
