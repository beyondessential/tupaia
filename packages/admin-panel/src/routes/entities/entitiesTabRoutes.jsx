import React from 'react';
import { entities } from './entities';
import { countries } from './countries';
import { entityTypes } from './entityTypes';
import { entityHierarchies } from './entityHierarchies';
import { EntitiesIcon } from '../../icons';
import { ALL_PROJECTS_SCOPE, SINGLE_PROJECT_SCOPE } from '../scopes';

export const entitiesTabRoutes = {
  label: 'Entities',
  path: '/entities',
  icon: <EntitiesIcon />,
  childViews: [
    { ...entities, scope: SINGLE_PROJECT_SCOPE },
    { ...entityHierarchies, scope: SINGLE_PROJECT_SCOPE },
    // RN-1855: matrix excludes these from the Single Project section.
    // No new home defined yet — keeping in All Projects for now.
    { ...countries, scope: ALL_PROJECTS_SCOPE },
    { ...entityTypes, scope: ALL_PROJECTS_SCOPE },
  ],
};
