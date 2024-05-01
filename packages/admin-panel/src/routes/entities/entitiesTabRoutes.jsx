/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { Storage } from '@material-ui/icons';
import { entities } from './entities';
import { countries } from './countries';
import { entityTypes } from './entityTypes';
import { entityHierarchies } from './entityHierarchies';

export const entitiesTabRoutes = {
  label: 'Entities',
  url: '/entities',
  icon: <Storage />,
  childViews: [entities, countries, entityTypes, entityHierarchies],
};
