/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { CreateHandler } from '../CreateHandler';
import { assertAnyPermissions, assertBESAdminAccess } from '../../permissions';

/**
 * Handles POST endpoints:
 * - /surveys
 */

export class CreateSurvey extends CreateHandler {
  async assertUserHasAccess() {
    await this.assertPermissions(
      assertAnyPermissions([assertBESAdminAccess], 'You need BES Admin to create new Surveys'),
    );
  }

  async createRecord() {
    const {
      code,
      'data_group.service_type': dataGroupServiceType,
      'data_group.config': dataGroupConfig,
      ...rest
    } = this.newRecordData;

    await this.models.wrapInTransaction(async transactingModels => {
      const { id: dataGroupId } = await this.createDataGroup(transactingModels, {
        code,
        service_type: dataGroupServiceType,
        config: dataGroupConfig,
      });

      await transactingModels.survey.create({ code, data_group_id: dataGroupId, ...rest });
    });
  }

  async createDataGroup(models, data) {
    const dataGroup = await models.dataGroup.create(data);
    dataGroup.sanitizeConfig();
    await dataGroup.save();
    return dataGroup;
  }
}
