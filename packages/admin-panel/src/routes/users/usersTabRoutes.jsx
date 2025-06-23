import React from 'react';
import { PeopleAlt } from '@material-ui/icons';
import { users } from './users';
import { permissions } from './permissions';
import { permissionGroups } from './permissionGroups';
import { permissionGroupsViewer } from './permissionGroupsViewer';
import { accessRequests } from './accessRequests';

export const usersTabRoutes = {
  label: 'Users & permissions',
  path: '/users',
  icon: <PeopleAlt />,
  childViews: [users, permissions, permissionGroups, permissionGroupsViewer, accessRequests],
};
