/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { TYPES } from '@tupaia/database';
import { GETHandler } from '../GETHandler';
import { mergeMultiJoin } from '../utilities';
import { createDataElementDBFilter } from './assertDataElementPermissions';

export class GETDataElements extends GETHandler {
  permissionsFilteredInternally = true;

  async getPermissionsFilter(criteria, options) {
    const dbConditions = await createDataElementDBFilter(this.accessPolicy, this.models, criteria);
    return { dbConditions, dbOptions: options };
  }

  async getPermissionsViaParentFilter(criteria, options) {
    const dbConditions = await createDataElementDBFilter(this.accessPolicy, this.models, criteria);
    const dbOptions = { ...options };
    dbConditions[`${TYPES.DATA_ELEMENT_DATA_GROUP}.data_group_id`] = this.parentRecordId;
    dbOptions.multiJoin = mergeMultiJoin(
      [
        {
          joinWith: TYPES.DATA_ELEMENT_DATA_GROUP,
          joinCondition: [
            `${TYPES.DATA_ELEMENT_DATA_GROUP}.data_element_id`,
            `${TYPES.DATA_ELEMENT}.id`,
          ],
        },
      ],
      dbOptions.multiJoin,
    );

    return { dbConditions, dbOptions };
  }
}
