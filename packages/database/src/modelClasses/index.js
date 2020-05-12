/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { DataElementDataGroupModel as DataElementDataGroup } from './DataElementDataGroup';
import { DataSourceModel as DataSource } from './DataSource';
import { EntityModel } from './Entity';

// export all models to be used in constructing a ModelRegistry
export const modelClasses = {
  DataElementDataGroup,
  DataSource,
  Entity: EntityModel,
};
