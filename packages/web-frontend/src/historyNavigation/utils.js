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

import {
  PATH_COMPONENTS,
  SEARCH_PARAM_KEY_MAP,
} from './constants';

export const translateLocationToInternal = location => {
  const { pathname, search } = location;
  return {
    pathname,
    search: replaceKeysAndRemoveNull(
      queryString.parse(search),
      swapKeyAndVal(SEARCH_PARAM_KEY_MAP),
    ),
  };
};

export const createUrl = (pathParams, searchParams) => {
  const { userPage } = pathParams;
  if (userPage) {
    // TODO: need more specification for userPage
    return { pathname: `/${userPage}` };
  }

  const urlComponents = PATH_COMPONENTS.map(component => pathParams[component]);

  // remove falsey last elements
  // e.g. [null, 'hi', 'hey', undefined, ''] => [null, 'hi', 'hey']
  while (urlComponents.length > 0 && !urlComponents[urlComponents.length - 1]) {
    urlComponents.pop();
  }

  const pathname = `/${urlComponents.join('/')}`;
  return { pathname, search: replaceKeysAndRemoveNull(searchParams, {}) }; //TODO: Not like this
}

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
  return false; // TODO
  /* Old implementation below:
    const { measureId: prevMeasureId, ...prev } = decodeUrl(a.pathname, a.search);
    const { measureId: nextMeasureId, ...next } = decodeUrl(b.pathname, b.search);
  
    if (!Object.keys(prev).every(k => prev[k] === next[k])) {
      return false;
    }
  
    if (prevMeasureId && nextMeasureId && prevMeasureId !== nextMeasureId) {
      // only update history if measures are different, not when going from null to non-null
      return false;
    }
  
    return true;
    */
}

export const replaceKeysAndRemoveNull = (obj, mapping) => {
  const newObj = {}; // TODO: Write better (shouldn't need these funcs I don't think)
  Object.entries(obj).forEach(([key, val]) => {
    if (val !== null && val !== undefined) newObj[mapping[key] || key] = val; // TODO: Not like this
  });
  return newObj;
};

const swapKeyAndVal = obj => {
  const newObj = {};
  Object.entries(obj).forEach(([key, val]) => {
    newObj[val] = key;
  });
  return newObj;
};
