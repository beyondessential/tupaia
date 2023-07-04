/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { ChangeEvent } from 'react';
import { DEFAULT_PERIOD_PARAM_STRING, URL_SEARCH_PARAMS } from '../constants';
import { useSearchParams } from 'react-router-dom';

export const updateSelectedMapOverlay = (e: ChangeEvent<HTMLInputElement>) => {
  const [urlSearchParams, setUrlParams] = useSearchParams();
  urlSearchParams.set(URL_SEARCH_PARAMS.MAP_OVERLAY, e.target.value);
  // when overlay changes, reset period to default
  urlSearchParams.set(URL_SEARCH_PARAMS.MAP_OVERLAY_PERIOD, DEFAULT_PERIOD_PARAM_STRING);
  setUrlParams(urlSearchParams);
};
