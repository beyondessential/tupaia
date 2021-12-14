/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { GETHandler } from '../GETHandler';
import { createDataGroupDBFilter } from './assertDataGroupPermissions';

export class GETDataGroups extends GETHandler {
  permissionsFilteredInternally = true;

  async getPermissionsFilter(criteria, options) {
    const dbConditions = await createDataGroupDBFilter(this.accessPolicy, this.models, criteria);
    return { dbConditions, dbOptions: options };
  }
}
