/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { entities } from './entities';
import { countries } from './countries';
import { entityTypes } from './entityTypes';
import { entityHierarchies } from './entityHierarchies';
import { EntitiesIcon } from '../../icons';

export const entitiesTabRoutes = {
  label: 'Entities',
  url: '/entities',
  icon: <EntitiesIcon />,
  childViews: [entities, countries, entityTypes, entityHierarchies],
};
