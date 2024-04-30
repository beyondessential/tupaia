/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { InsertChart } from '@material-ui/icons';
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

export const visualisationsTabRoutes = {
  label: 'Visualisations',
  url: '/visualisations',
  icon: <InsertChart />,
  childViews: [
    dashboardItems,
    dashboards,
    dashboardRelations,
    dashboardMailingLists,
    legacyReports,
    mapOverlays,
    mapOverlayGroups,
    mapOverlayGroupRelations,
    indicators,
    dataTables,
    socialFeed,
  ],
};
