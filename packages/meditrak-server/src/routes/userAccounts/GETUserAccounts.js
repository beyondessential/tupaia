/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { QUERY_CONJUNCTIONS } from '@tupaia/database';
import { GETHandler } from '../GETHandler';
import {
  assertAnyPermissions,
  assertBESAdminAccess,
  assertTupaiaAdminPanelAccess,
  hasBESAdminAccess,
} from '../../permissions';
import { TUPAIA_ADMIN_PANEL_PERMISSION_GROUP } from '../../permissions/constants';
import { assertUserAccountPermissions } from './assertUserAccountPermissions';

const { RAW } = QUERY_CONJUNCTIONS;

/**
 * Handles endpoints:
 * - /users
 * - /users/:userId
 */

export class GETUserAccounts extends GETHandler {
  async assertUserHasAccess() {
    await this.assertPermissions(
      assertAnyPermissions(
        [assertBESAdminAccess, assertTupaiaAdminPanelAccess],
        'You need either BES Admin or Tupaia Admin Panel access to view user accounts',
      ),
    );
  }

  async findSingleRecord(userAccountId, options) {
    const userAccount = await super.findSingleRecord(userAccountId, options);

    const userAccountChecker = accessPolicy =>
      assertUserAccountPermissions(accessPolicy, this.models, userAccount);

    await this.assertPermissions(assertAnyPermissions([assertBESAdminAccess, userAccountChecker]));

    return userAccount;
  }

  async findRecords(criteria, options) {
    const dbConditions = criteria;
    if (!hasBESAdminAccess(this.accessPolicy)) {
      // If we don't have BES Admin access, add a filter to the SQL query
      const countryList = this.accessPolicy.getEntitiesByPermission(
        TUPAIA_ADMIN_PANEL_PERMISSION_GROUP,
      );
      countryList.push('DL'); // If we have admin panel anywhere, we can also view Demo Land
      const entities = await this.models.entity.find({
        code: countryList,
      });
      const entityIds = entities.map(e => e.id);
      dbConditions[RAW] = {
        sql: `array(select entity_id from user_entity_permission uep where uep.user_id = user_account.id) <@ array[${entityIds
          .map(() => '?')
          .join(',')}]`,
        parameters: entityIds,
      };
    }
    const userAccounts = await super.findRecords(dbConditions, options);

    if (!userAccounts.length) {
      throw new Error('Your permissions do not allow access to any of the requested resources');
    }

    return userAccounts;
  }
}
