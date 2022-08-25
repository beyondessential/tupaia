/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { createSelector } from 'reselect';

import { getLocationComponentValue, URL_COMPONENTS } from '../historyNavigation';
import { selectLocation } from './utils';

export const selectMobileTab = createSelector([selectLocation], location =>
  getLocationComponentValue(location, URL_COMPONENTS.MOBILE_TAB),
);

export const selectIfIsPDFExporting = createSelector([selectLocation], location =>
  getLocationComponentValue(location, URL_COMPONENTS.PDF_EXPORT),
);
