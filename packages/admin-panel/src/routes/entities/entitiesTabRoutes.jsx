import React from 'react';
import { entities } from './entities';
import { entityHierarchies } from './entityHierarchies';
import { EntitiesIcon } from '../../icons';
import { SINGLE_PROJECT_SCOPE } from '../scopes';

// TUP-3055: Countries and Entity Types removed from sidebar per matrix.
export const entitiesTabRoutes = {
  label: 'Entities',
  path: '/entities',
  icon: <EntitiesIcon />,
  childViews: [
    { ...entities, scope: SINGLE_PROJECT_SCOPE },
    { ...entityHierarchies, scope: SINGLE_PROJECT_SCOPE },
  ],
};
