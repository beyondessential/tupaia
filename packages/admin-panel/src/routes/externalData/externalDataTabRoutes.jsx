import React from 'react';
import { Language } from '@material-ui/icons';
import { externalDatabaseConnections } from './externalDatabaseConnections';
import { dhisInstances } from './dhisInstances';
import { supersetInstances } from './msupplySupersetInstances';
import { BES_ADMIN_PERMISSION_GROUP } from '../../utilities/userAccess';
import { ALL_PROJECTS_SCOPE } from '../scopes';

export const externalDataTabRoutes = {
  label: 'External data',
  path: '/external-database-connections',
  icon: <Language />,
  childViews: [
    { ...externalDatabaseConnections, scope: ALL_PROJECTS_SCOPE },
    { ...dhisInstances, scope: ALL_PROJECTS_SCOPE },
    { ...supersetInstances, scope: ALL_PROJECTS_SCOPE },
  ],
  requiresSomePermissionGroup: [BES_ADMIN_PERMISSION_GROUP],
};
