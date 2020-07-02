/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { DataSourceModel as CommonDataSourceModel } from '@tupaia/database';

export const DATA_SOURCE_SERVICE_TYPES = ['dhis', 'tupaia'];

export class DataSourceModel extends CommonDataSourceModel {
  isDeletableViaApi = true;
}
