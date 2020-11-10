/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 **/

import { DatabaseModel, DatabaseType, TYPES } from '@tupaia/database';

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
}

export class SurveyModel extends DatabaseModel {
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
      return models.dataSource.updateById(dataSourceId, { code });
    }
    case 'delete': {
      const { data_source_id: dataSourceId } = oldRecord;
      return models.dataSource.deleteById(dataSourceId);
    }
    default:
      throw new Error(`Non supported change type: ${changeType}`);
  }
};
