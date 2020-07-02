/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 **/

import { DatabaseModel, DatabaseType, TYPES } from '@tupaia/database';
import { reduceToDictionary } from '@tupaia/utils';

class QuestionType extends DatabaseType {
  static databaseType = TYPES.QUESTION;
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

const onChangeUpdateDataElement = async ({ type: changeType, record }, models) => {
  const { code, data_source_id: dataSourceId } = record;

  switch (changeType) {
    case 'update':
      return models.dataSource.updateById(dataSourceId, { code });
    case 'delete':
      return models.dataSource.deleteById(dataSourceId);
    default:
      throw new Error(`Non supported change type: ${changeType}`);
  }
};
