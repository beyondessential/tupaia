/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { DataSourceModel as CommonDataSourceModel } from '@tupaia/database';

export class DataSourceModel extends CommonDataSourceModel {
  isDeletableViaApi = true;
}
