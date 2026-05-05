import React from 'react';
import { countries } from './countries';
import { entities } from './entities';
import { entityHierarchies } from './entityHierarchies';
import { entityTypes } from './entityTypes';
import { EntitiesIcon } from '../../icons';
import { ALL_PROJECTS_SCOPE, SINGLE_PROJECT_SCOPE } from '../scopes';

export const entitiesTabRoutes = {
  label: 'Entities',
  path: '/entities',
  icon: <EntitiesIcon />,
  childViews: [
    { ...entities, scope: SINGLE_PROJECT_SCOPE },
    { ...entityHierarchies, scope: SINGLE_PROJECT_SCOPE },
    { ...countries, scope: ALL_PROJECTS_SCOPE },
    { ...entityTypes, scope: ALL_PROJECTS_SCOPE },
  ],
};
