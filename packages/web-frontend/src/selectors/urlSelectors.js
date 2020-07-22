/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import { createSelector } from 'reselect';

import { getUrlComponent } from '../historyNavigation/historyNavigation';
import { URL_COMPONENTS } from '../historyNavigation/constants';

const selectLocation = state => state.routing;

export const selectCurrentProjectCode = createSelector([selectLocation], location =>
  getUrlComponent(URL_COMPONENTS.PROJECT, location),
);

export const selectCurrentOrgUnitCode = createSelector([selectLocation], location =>
  getUrlComponent(URL_COMPONENTS.ORG_UNIT, location),
);

export const selectCurrentDashboardGroupCode = createSelector([selectLocation], location =>
  getUrlComponent(URL_COMPONENTS.DASHBOARD, location),
);

export const selectCurrentUserPage = createSelector([selectLocation], location =>
  getUrlComponent(URL_COMPONENTS.USER_PAGE, location),
);

export const selectCurrentOverlayCode = createSelector([selectLocation], location =>
  getUrlComponent(URL_COMPONENTS.MEASURE, location),
);

export const selectCurrentExpandedReportCode = createSelector([selectLocation], location =>
  getUrlComponent(URL_COMPONENTS.REPORT, location),
);
