/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { buildDataElementFetch } from './dataElement';
import { buildDataGroupFetch } from './dataGroup';

export const fetchBuilders = {
  dataElements: buildDataElementFetch,
  dataGroups: buildDataGroupFetch,
};
