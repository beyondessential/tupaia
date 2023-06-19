/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

export const removeUrlSearchParams = (paramsToRemove?: string[]) => {
  const urlSearchParams = new URLSearchParams(window.location.search); // need to access the params directly from the location object, because useSearchParams from react-router-dom doesn't work when called outside of a component
  if (paramsToRemove) {
    paramsToRemove.forEach(param => {
      urlSearchParams.delete(param);
    });
  }
  return urlSearchParams.toString();
};
