import React from 'react';
import { PeopleAlt } from '@material-ui/icons';
import { users } from './users';
import { permissions } from './permissions';
import { permissionGroups } from './permissionGroups';
import { permissionGroupsViewer } from './permissionGroupsViewer';
import { accessRequests } from './accessRequests';
import { ALL_PROJECTS_SCOPE } from '../scopes';

export const usersTabRoutes = {
  label: 'Users & permissions',
  path: '/users',
  icon: <PeopleAlt />,
  childViews: [
    { ...users, scope: ALL_PROJECTS_SCOPE },
    { ...permissions, scope: ALL_PROJECTS_SCOPE },
    { ...permissionGroups, scope: ALL_PROJECTS_SCOPE },
    { ...permissionGroupsViewer, scope: ALL_PROJECTS_SCOPE },
    { ...accessRequests, scope: ALL_PROJECTS_SCOPE },
  ],
};
