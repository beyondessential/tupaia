import React from 'react';
import { Language } from '@material-ui/icons';
import { externalDatabaseConnections } from './externalDatabaseConnections';
import { dhisInstances } from './dhisInstances';
import { supersetInstances } from './msupplySupersetInstances';

export const externalDataTabRoutes = {
  label: 'External data',
  path: '/external-database-connections',
  icon: <Language />,
  childViews: [externalDatabaseConnections, dhisInstances, supersetInstances],
  isBESAdminOnly: true,
};
