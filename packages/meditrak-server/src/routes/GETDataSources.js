/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { TYPES } from '@tupaia/database';
import { GETHandler } from './GETHandler';
import { assertBESAdminAccess } from '../permissions';
import { mergeMultiJoin } from './utilities';

export class GETDataSources extends GETHandler {
  permissionsFilteredInternally = true;

  async assertUserHasAccess() {
    await this.assertPermissions(assertBESAdminAccess);
  }

  async getPermissionsFilter(criteria, options) {
    return { dbConditions: criteria, dbOptions: options };
  }

  async getPermissionsViaParentFilter(criteria, options) {
    const dbConditions = { ...criteria };
    const dbOptions = { ...options };
    dbConditions[`${TYPES.DATA_ELEMENT_DATA_GROUP}.data_group_id`] = this.parentRecordId;
    dbOptions.multiJoin = mergeMultiJoin(
      [
        {
          joinWith: TYPES.DATA_ELEMENT_DATA_GROUP,
          joinCondition: [
            `${TYPES.DATA_ELEMENT_DATA_GROUP}.data_element_id`,
            `${TYPES.DATA_SOURCE}.id`,
          ],
        },
      ],
      dbOptions.multiJoin,
    );

    return { dbConditions, dbOptions };
  }
}
