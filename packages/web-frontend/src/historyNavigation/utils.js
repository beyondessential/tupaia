/**
 * Tupaia Web
 * Copyright (c) 2020 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

/**
 * History utils. These are helper functions that aren't used outside of historyNavigation.
 */
import { invert } from 'lodash';
import moment from 'moment';
import queryString from 'query-string';
import {
  momentToDateString,
  GRANULARITIES,
  GRANULARITIES_WITH_ONE_DATE,
  GRANULARITY_CONFIG,
  roundStartEndDates,
} from '../utils/periodGranularities';
import {
  LEGACY_PATH_PREFIXES,
  PATH_COMPONENTS,
  SEARCH_COMPONENTS,
  SEARCH_PARAM_KEY_MAP,
  URL_COMPONENTS,
  USER_PAGE_PREFIXES,
} from './constants';

export const createLocation = params => {
  const { userPage } = params;

  // Userpage urls are hanlded differently to project pages (eg. reset-password and verify-email)
  // Assumption - Only load the user page url if there is no project being loaded
  if (userPage && !params.PROJECT) {
    return { pathname: `/${userPage}`, search: '' };
  }

  const pathComponents = PATH_COMPONENTS.map(component => params[component]);

  // remove falsy last elements
  // e.g. [null, 'hi', 'hey', undefined, ''] => [null, 'hi', 'hey']
  while (pathComponents.length > 0 && !pathComponents[pathComponents.length - 1]) {
    pathComponents.pop();
  }
  const pathname = `/${pathComponents.map(component => component || 'loading').join('/')}`;

  const searchComponents = {};
  SEARCH_COMPONENTS.forEach(component => {
    const value = params[component];
    if (value !== undefined) searchComponents[component] = value;
  });

  return { pathname, search: stringifySearch(searchComponents) };
};

export const decodeLocation = ({ pathname, search }) => {
  const cleanPathname = pathname[0] === '/' ? pathname.slice(1) : pathname;
  const searchParams = parseSearch(search);
  if (cleanPathname === '') {
    return { projectSelector: true, ...searchParams };
  }

  const [prefixOrProject, ...restOfPath] = cleanPathname.split('/');
  if (USER_PAGE_PREFIXES.includes(prefixOrProject)) {
    return { userPage: prefixOrProject, ...searchParams };
  }

  const [, ...restOfComponents] = PATH_COMPONENTS;

  /**
   * Support link form:
   *    https://mobile.tupaia.org/facility/${facilityCode}
   *    https://mobile.tupaia.org/country/${countryCode}
   * Change to:
   *    https://mobile.tupaia.org/explore/${facilityCode}
   *    https://mobile.tupaia.org/explore/${countryCode}
   */
  const pathParams = {
    PROJECT: LEGACY_PATH_PREFIXES.includes(prefixOrProject) ? 'explore' : prefixOrProject,
  };
  restOfPath.forEach((value, i) => {
    pathParams[restOfComponents[i]] = value;
  });

  return {
    ...pathParams,
    ...searchParams,
  };
};

export const isLocationEqual = (a, b) => {
  const { [URL_COMPONENTS.MAP_OVERLAY_IDS]: prevMapOverlayIds, ...prev } = decodeLocation(a);
  const { [URL_COMPONENTS.MAP_OVERLAY_IDS]: nextMapOverlayIds, ...next } = decodeLocation(b);

  if (!Object.keys(prev).every(k => prev[k] === next[k])) {
    return false;
  }

  if (prevMapOverlayIds && nextMapOverlayIds && prevMapOverlayIds !== nextMapOverlayIds) {
    // only update history if measures are different, not when going from null to non-null
    return false;
  }

  return true;
};

export const convertUrlPeriodStringToDateRange = (
  periodString,
  granularity = GRANULARITIES.DAY,
) => {
  const [startDate, endDate] = periodString.split('-');

  if (!startDate) {
    return {
      startDate: null,
      endDate: null,
    };
  }

  const { urlFormat } = GRANULARITY_CONFIG[granularity];

  const momentStartDate = moment(startDate, urlFormat);
  if (GRANULARITIES_WITH_ONE_DATE.includes(granularity)) {
    return {
      startDate: momentStartDate,
      endDate: momentStartDate,
    };
  }
  // We rely on dates being rounded in state for range formats
  const momentEndDate = moment(endDate, urlFormat);
  return roundStartEndDates(granularity, momentStartDate, momentEndDate);
};

export const convertDateRangeToUrlPeriodString = (
  { startDate, endDate },
  granularity = GRANULARITIES.DAY,
) => {
  if (!(startDate || endDate)) return null;

  const { urlFormat } = GRANULARITY_CONFIG[granularity];

  const formattedStartDate = momentToDateString(startDate, granularity, urlFormat);
  const formattedEndDate = momentToDateString(endDate, granularity, urlFormat);

  return GRANULARITIES_WITH_ONE_DATE.includes(granularity)
    ? formattedEndDate
    : `${formattedStartDate}-${formattedEndDate}`;
};

const parseSearch = search => {
  const externalSearchParams = queryString.parse(search);
  const invertedMap = invert(SEARCH_PARAM_KEY_MAP);

  return replaceKeysAndRemoveEmpty(externalSearchParams, invertedMap);
};

const stringifySearch = search => {
  const externalSearchParams = replaceKeysAndRemoveEmpty(search, SEARCH_PARAM_KEY_MAP);

  return `?${queryString.stringify(externalSearchParams)}`;
};

const replaceKeysAndRemoveEmpty = (obj, mapping) => {
  const newObj = {};
  Object.entries(obj).forEach(([key, val]) => {
    if (val !== null && val !== undefined) newObj[mapping[key]] = val;
  });
  return newObj;
};
