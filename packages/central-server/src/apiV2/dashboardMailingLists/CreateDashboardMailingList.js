/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { CreateHandler } from '../CreateHandler';
import { assertAnyPermissions, assertBESAdminAccess } from '../../permissions';
// import { assertDashboardEditPermissions } from '../dashboards/assertDashboardsPermissions';

export class CreateDashboardMailingList extends CreateHandler {
  async assertUserHasAccess() {
    // Limit this to BES Admin for now as this feature is still under construction
    // TODO: RN-1101 Remove this check and uncomment the one below when mailing list complete
    await this.assertPermissions(assertAnyPermissions([assertBESAdminAccess]));

    // const dashboardEditChecker = accessPolicy =>
    //   assertDashboardEditPermissions(accessPolicy, this.models, this.newRecordData.dashboard_id);

    // // User must have edit access to the dashboard in order to create a mailing list
    // await this.assertPermissions(
    //   assertAnyPermissions([assertBESAdminAccess, dashboardEditChecker]),
    // );
  }

  async createRecord() {
    return this.insertRecord();
  }
}
