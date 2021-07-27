/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { MaterializedViewLogDatabaseModel, DatabaseType, TYPES } from '@tupaia/database';

class SurveyType extends DatabaseType {
  static databaseType = TYPES.SURVEY;

  static meditrakConfig = {
    minAppVersion: '0.0.1',
  };

  async dataGroup() {
    return this.otherModels.dataSource.findById(this.data_source_id);
  }

  async questions() {
    const questions = await this.database.executeSql(
      `
      SELECT q.* FROM question q
      JOIN survey_screen_component ssc ON ssc.question_id  = q.id
      JOIN survey_screen ss ON ss.id = ssc.screen_id
      JOIN survey s ON s.id = ss.survey_id
      WHERE s.code = ?
    `,
      [this.code],
    );

    return Promise.all(questions.map(this.otherModels.question.generateInstance));
  }

  async getPermissionGroup() {
    return this.otherModels.permissionGroup.findById(this.permission_group_id);
  }

  async getCountries() {
    return this.otherModels.country.findManyById(this.country_ids);
  }

  async getCountryCodes() {
    const countries = await this.getCountries();
    return countries.map(c => c.code);
  }
}

export class SurveyModel extends MaterializedViewLogDatabaseModel {
  notifiers = [onChangeUpdateDataGroup];

  get DatabaseTypeClass() {
    return SurveyType;
  }

  meditrakConfig = {
    minAppVersion: '0.0.1',
  };

  isDeletableViaApi = true;
}

const onChangeUpdateDataGroup = async (
  { type: changeType, old_record: oldRecord, new_record: newRecord },
  models,
) => {
  switch (changeType) {
    case 'update': {
      const { code, data_source_id: dataSourceId } = newRecord;
      await models.dataSource.updateById(dataSourceId, { code });

      if (oldRecord && newRecord.period_granularity !== oldRecord.period_granularity) {
        // the `outdated` status of survey responses must be re-calculated, since it depends on
        // the period granularity of the survey they belong to
        // no need to await for the operation, just get it going
        models.surveyResponse.markAsChanged({ survey_id: newRecord.id });
      }
      return true;
    }
    case 'delete': {
      const { data_source_id: dataSourceId } = oldRecord;
      return models.dataSource.deleteById(dataSourceId);
    }
    default:
      throw new Error(`Non supported change type: ${changeType}`);
  }
};
