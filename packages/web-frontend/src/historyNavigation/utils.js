/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

/**
 * History utils. These are helper functions that aren't used outside of historyNavigation.
 */
import queryString from 'query-string';
import { pickBy, invert } from 'lodash';

import {
  PATH_COMPONENTS,
  SEARCH_COMPONENTS,
  SEARCH_PARAM_KEY_MAP,
  PASSWORD_RESET_PREFIX,
  VERIFY_EMAIL_PREFIX,
  URL_COMPONENTS,
} from './constants';

export const createUrl = params => {
  const { userPage } = params;
  if (userPage) {
    // TODO: Userpage logic to come in future PR
    return { pathname: `/${userPage}` };
  }

  const urlComponents = PATH_COMPONENTS.map(component => params[component]);
  const searchComponents = SEARCH_COMPONENTS.map(component => params[component]);
  const cleanedSearchComponents = pickBy(
    searchComponents,
    (component, value) => value !== undefined,
  );

  // remove falsy last elements
  // e.g. [null, 'hi', 'hey', undefined, ''] => [null, 'hi', 'hey']
  while (urlComponents.length > 0 && !urlComponents[urlComponents.length - 1]) {
    urlComponents.pop();
  }

  const pathname = `/${urlComponents.join('/')}`;
  return { pathname, search: cleanedSearchComponents };
};

export const decodeUrl = (pathname, search) => {
  const cleanPathname = pathname[0] === '/' ? pathname.slice(1) : pathname;
  if (cleanPathname === '') {
    return { projectSelector: true, ...search };
  }

  const pathParams = {};
  const [prefixOrProject, ...restOfPath] = cleanPathname.split('/');
  const [, ...restOfComponents] = PATH_COMPONENTS;

  restOfPath.forEach((value, i) => {
    pathParams[restOfComponents[i]] = value;
  });

  switch (prefixOrProject) {
    case PASSWORD_RESET_PREFIX:
      return { userPage: prefixOrProject, ...search };
    case VERIFY_EMAIL_PREFIX:
      return { userPage: prefixOrProject, ...search };
    default:
      return {
        PROJECT: prefixOrProject,
        ...pathParams,
        ...search,
      };
  }
};

export const isLocationEqual = (a, b) => {
  const { [URL_COMPONENTS.MEASURE]: prevMeasureId, ...prev } = decodeUrl(a.pathname, a.search);
  const { [URL_COMPONENTS.MEASURE]: nextMeasureId, ...next } = decodeUrl(b.pathname, b.search);

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

  return replaceKeysAndRemoveNull(externalSearchParams, invertedMap);
};

export const translateSearchToExternal = search => {
  const externalSearchParams = replaceKeysAndRemoveNull(search, SEARCH_PARAM_KEY_MAP);

  return queryString.stringify(externalSearchParams);
};

const replaceKeysAndRemoveNull = (obj, mapping) => {
  const newObj = {};
  Object.entries(obj).forEach(([key, val]) => {
    if (val !== null && val !== undefined) newObj[mapping[key]] = val;
  });
  return newObj;
};
