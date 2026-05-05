import React from 'react';
import { dashboardItems } from './dashboardItems';
import { dashboards } from './dashboards';
import { dashboardRelations } from './dashboardRelations';
import { dashboardMailingLists } from './dashboardMailingLists';
import { dataTables } from './dataTables';
import { indicators } from './indicators';
import { legacyReports } from './legacyReports';
import { mapOverlays } from './mapOverlays';
import { mapOverlayGroups } from './mapOverlayGroups';
import { mapOverlayGroupRelations } from './mapOverlayGroupRelations';
import { socialFeed } from './socialFeed';
import { VizIcon } from '../../icons';
import { ALL_PROJECTS_SCOPE } from '../scopes';

// TUP-3055 Phase 2: dashboards / mapOverlays / legacyReports family will move
// to SINGLE_PROJECT_SCOPE once central-server supports the indirect project
// filters (project_codes TEXT[] arrays + transitive joins). Until then they
// live under All data so the data isn't silently project-scoped without a
// working filter.
export const visualisationsTabRoutes = {
  label: 'Visualisations',
  path: '/visualisations',
  icon: <VizIcon />,
  childViews: [
    { ...dashboardItems, scope: ALL_PROJECTS_SCOPE },
    { ...dashboards, scope: ALL_PROJECTS_SCOPE },
    { ...dashboardRelations, scope: ALL_PROJECTS_SCOPE },
    { ...dashboardMailingLists, scope: ALL_PROJECTS_SCOPE },
    { ...legacyReports, scope: ALL_PROJECTS_SCOPE },
    { ...mapOverlays, scope: ALL_PROJECTS_SCOPE },
    { ...mapOverlayGroups, scope: ALL_PROJECTS_SCOPE },
    { ...mapOverlayGroupRelations, scope: ALL_PROJECTS_SCOPE },
    { ...socialFeed, scope: ALL_PROJECTS_SCOPE },
    { ...indicators, scope: ALL_PROJECTS_SCOPE },
    { ...dataTables, scope: ALL_PROJECTS_SCOPE },
  ],
};
