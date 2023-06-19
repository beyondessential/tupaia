/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useSearchParams } from 'react-router-dom';

export const removeParamsFromSearch = (paramsToRemove?: string[]) => {
  const [urlParams] = useSearchParams();
  if (paramsToRemove) {
    paramsToRemove.forEach(param => {
      urlParams.delete(param);
    });
  }
  return urlParams.toString();
};
