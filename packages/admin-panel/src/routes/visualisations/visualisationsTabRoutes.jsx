/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { dashboardItems } from './dashboardItems';
import { dashboards } from './dashboards';
import { dashboardRelations } from './dashboardRelations';
import { dashboardMailingLists } from './dashboardMailingLists';
import { legacyReports } from './legacyReports';
import { mapOverlays } from './mapOverlays';
import { mapOverlayGroups } from './mapOverlayGroups';
import { mapOverlayGroupRelations } from './mapOverlayGroupRelations';
import { indicators } from './indicators';
import { dataTables } from './dataTables';
import { socialFeed } from './socialFeed';
import { VizIcon } from '../../icons';

export const visualisationsTabRoutes = {
  label: 'Visualisations',
  path: '/visualisations',
  icon: <VizIcon />,
  childViews: [
    dashboardItems,
    dashboards,
    dashboardRelations,
    dashboardMailingLists,
    dataTables,
    legacyReports,
    mapOverlays,
    mapOverlayGroups,
    mapOverlayGroupRelations,
    indicators,
    socialFeed,
  ],
};
