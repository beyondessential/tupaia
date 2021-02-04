/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { DatabaseModel, DatabaseType, TYPES } from '@tupaia/database';
import { reduceToDictionary } from '@tupaia/utils';

class QuestionType extends DatabaseType {
  static databaseType = TYPES.QUESTION;

  dataElement = async () => this.otherModels.dataSource.findById(this.data_source_id);
}

const HOOKS_BY_ID_CACHE_KEY = 'hooksByQuestionId';

export class QuestionModel extends DatabaseModel {
  notifiers = [onChangeUpdateDataElement];

  get DatabaseTypeClass() {
    return QuestionType;
  }

  meditrakConfig = {
    minAppVersion: '0.0.1',
  };

  async getHooksByQuestionId() {
    return this.runCachedFunction(HOOKS_BY_ID_CACHE_KEY, async () => {
      const questionsWithHooks = await this.database.executeSql(`
        SELECT id, hook
        FROM question
        WHERE hook IS NOT NULL;
      `);
      return reduceToDictionary(questionsWithHooks, 'id', 'hook');
    });
  }
}

const onChangeUpdateDataElement = async (
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
