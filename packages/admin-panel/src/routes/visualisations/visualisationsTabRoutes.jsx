import React from 'react';
import { dashboardItems } from './dashboardItems';
import { dashboards } from './dashboards';
import { dashboardRelations } from './dashboardRelations';
import { dashboardMailingLists } from './dashboardMailingLists';
import { legacyReports } from './legacyReports';
import { mapOverlays } from './mapOverlays';
import { mapOverlayGroups } from './mapOverlayGroups';
import { mapOverlayGroupRelations } from './mapOverlayGroupRelations';
import { VizIcon } from '../../icons';
import { SINGLE_PROJECT_SCOPE } from '../scopes';

// TUP-3055: Social Feed Posts, Indicators, Data Tables removed from sidebar
// per refinement matrix. They are not registered here.
export const visualisationsTabRoutes = {
  label: 'Visualisations',
  path: '/visualisations',
  icon: <VizIcon />,
  childViews: [
    { ...dashboardItems, scope: SINGLE_PROJECT_SCOPE },
    { ...dashboards, scope: SINGLE_PROJECT_SCOPE },
    { ...dashboardRelations, scope: SINGLE_PROJECT_SCOPE },
    { ...dashboardMailingLists, scope: SINGLE_PROJECT_SCOPE },
    { ...legacyReports, scope: SINGLE_PROJECT_SCOPE },
    { ...mapOverlays, scope: SINGLE_PROJECT_SCOPE },
    { ...mapOverlayGroups, scope: SINGLE_PROJECT_SCOPE },
    { ...mapOverlayGroupRelations, scope: SINGLE_PROJECT_SCOPE },
  ],
};
