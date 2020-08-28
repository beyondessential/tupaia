/**
 * Tupaia Web
 * Copyright (c) 2020 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

/**
 * History utils. These are helper functions that aren't used outside of historyNavigation.
 */
import queryString from 'query-string';
import { invert } from 'lodash';

import {
  PATH_COMPONENTS,
  SEARCH_COMPONENTS,
  SEARCH_PARAM_KEY_MAP,
  USER_PAGE_PREFIXES,
  URL_COMPONENTS,
} from './constants';

export const createLocation = params => {
  const { userPage } = params;
  if (userPage) {
    // Userpage locations are created by the backend,
    // this is good enough for here
    return { pathname: `/${userPage}`, search: {} };
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

  return { pathname, search: searchComponents };
};

export const decodeLocation = ({ pathname, search }) => {
  const cleanPathname = pathname[0] === '/' ? pathname.slice(1) : pathname;
  if (cleanPathname === '') {
    return { projectSelector: true, ...search };
  }

  const [prefixOrProject, ...restOfPath] = cleanPathname.split('/');

  if (USER_PAGE_PREFIXES.includes(prefixOrProject)) {
    return { userPage: prefixOrProject, ...search };
  }

  const [, ...restOfComponents] = PATH_COMPONENTS;

  const pathParams = { PROJECT: prefixOrProject };
  restOfPath.forEach((value, i) => {
    pathParams[restOfComponents[i]] = value;
  });

  return {
    ...pathParams,
    ...search,
  };
};

export const isLocationEqual = (a, b) => {
  const { [URL_COMPONENTS.MEASURE]: prevMeasureId, ...prev } = decodeLocation(a);
  const { [URL_COMPONENTS.MEASURE]: nextMeasureId, ...next } = decodeLocation(b);

  if (!Object.keys(prev).every(k => prev[k] === next[k])) {
    return false;
  }

  if (prevMeasureId && nextMeasureId && prevMeasureId !== nextMeasureId) {
    // only update history if measures are different, not when going from null to non-null
    return false;
  }

  return true;
};

export const translateSearchToInternal = search => {
  const externalSearchParams = queryString.parse(search);
  const invertedMap = invert(SEARCH_PARAM_KEY_MAP);

  return replaceKeysAndRemoveEmpty(externalSearchParams, invertedMap);
};

export const translateSearchToExternal = search => {
  const externalSearchParams = replaceKeysAndRemoveEmpty(search, SEARCH_PARAM_KEY_MAP);

  return queryString.stringify(externalSearchParams);
};

const replaceKeysAndRemoveEmpty = (obj, mapping) => {
  const newObj = {};
  Object.entries(obj).forEach(([key, val]) => {
    if (val !== null && val !== undefined) newObj[mapping[key]] = val;
  });
  return newObj;
};
