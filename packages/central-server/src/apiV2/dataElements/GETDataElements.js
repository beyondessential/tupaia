import { RECORDS } from '@tupaia/database';
import { GETHandler } from '../GETHandler';
import { mergeMultiJoin } from '../utilities';
import {
  assertDataElementGETPermissions,
  createDataElementDBFilter,
} from './assertDataElementPermissions';
import { assertAnyPermissions, assertBESAdminAccess } from '../../permissions';

export class GETDataElements extends GETHandler {
  permissionsFilteredInternally = /** @type {const} */ (true);

  async findSingleRecord(dataElementId, options) {
    const dataElementPermissionChecker = accessPolicy =>
      assertDataElementGETPermissions(accessPolicy, this.models, dataElementId);
    await this.assertPermissions(
      assertAnyPermissions([assertBESAdminAccess, dataElementPermissionChecker]),
    );

    return super.findSingleRecord(dataElementId, options);
  }

  async getPermissionsFilter(criteria, options) {
    const dbConditions = await createDataElementDBFilter(this.accessPolicy, this.models, criteria);
    return { dbConditions, dbOptions: options };
  }

  async getPermissionsViaParentFilter(criteria, options) {
    const dbConditions = await createDataElementDBFilter(this.accessPolicy, this.models, criteria);
    const dbOptions = { ...options };
    dbConditions[`${RECORDS.DATA_ELEMENT_DATA_GROUP}.data_group_id`] = this.parentRecordId;
    dbOptions.multiJoin = mergeMultiJoin(
      [
        {
          joinWith: RECORDS.DATA_ELEMENT_DATA_GROUP,
          joinCondition: [
            `${RECORDS.DATA_ELEMENT_DATA_GROUP}.data_element_id`,
            `${RECORDS.DATA_ELEMENT}.id`,
          ],
        },
      ],
      dbOptions.multiJoin,
    );

    return { dbConditions, dbOptions };
  }
}
