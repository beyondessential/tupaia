/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import { ObjectValidator, constructIsEmptyOr, constructRecordExistsWithCode } from '@tupaia/utils';
import { EditHandler } from '../EditHandler';
import {
  assertAllPermissions,
  assertAnyPermissions,
  assertBESAdminAccess,
  assertVizBuilderAccess,
} from '../../permissions';
import { assertDashboardItemEditPermissions } from './assertDashboardItemsPermissions';

export class EditDashboardItem extends EditHandler {
  async assertUserHasAccess() {
    const dashboardItemChecker = accessPolicy =>
      assertDashboardItemEditPermissions(accessPolicy, this.models, this.recordId);

    await this.assertPermissions(
      assertAnyPermissions([
        assertBESAdminAccess,
        assertAllPermissions([assertVizBuilderAccess, dashboardItemChecker]),
      ]),
    );
  }

  async validate() {
    const validateReportExists = async reportCode => {
      const existingRecord = await this.models.dashboardItem.findOne({
        id: this.recordId,
      });
      // if the report is not a legacy report, check if the report exists
      if (!existingRecord.legacy) {
        return constructRecordExistsWithCode(this.models.report)(reportCode);
      }
      return true;
    };

    const validationCriteria = {
      report_code: [constructIsEmptyOr(validateReportExists)],
    };

    const validator = new ObjectValidator(validationCriteria);
    return validator.validate({
      report_code: this.updatedFields.report_code,
    }); // Will throw an error if not valid
  }

  async editRecord() {
    await this.updateRecord();
  }
}
