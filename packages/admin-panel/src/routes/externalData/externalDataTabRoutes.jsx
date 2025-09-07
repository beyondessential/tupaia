import React from 'react';
import { Language } from '@material-ui/icons';
import { externalDatabaseConnections } from './externalDatabaseConnections';
import { dhisInstances } from './dhisInstances';
import { supersetInstances } from './msupplySupersetInstances';
import { BES_ADMIN_PERMISSION_GROUP } from '../../utilities/userAccess';

export const externalDataTabRoutes = {
  label: 'External data',
  path: '/external-database-connections',
  icon: <Language />,
  childViews: [externalDatabaseConnections, dhisInstances, supersetInstances],
  requiresSomePermissionGroup: [BES_ADMIN_PERMISSION_GROUP],
};
