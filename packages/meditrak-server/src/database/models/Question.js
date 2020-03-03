/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 **/

import { DatabaseModel, DatabaseType, TYPES } from '@tupaia/database';

class QuestionType extends DatabaseType {
  static databaseType = TYPES.QUESTION;

  static meditrakConfig = {
    minAppVersion: '0.0.1',
  };
}

const HOOKS_BY_ID_CACHE_KEY = 'hooksByQuestionId';

export class QuestionModel extends DatabaseModel {
  get DatabaseTypeClass() {
    return QuestionType;
  }

  async getHooksByQuestionId() {
    return this.runCachedFunction(HOOKS_BY_ID_CACHE_KEY, async () => {
      const questionsWithHooks = await this.database.executeSql(`
        SELECT id, hook
        FROM question
        WHERE hook IS NOT NULL;
      `);
      return questionsWithHooks.reduce(
        (hooksByQuestionId, { id: questionId, hook }) => ({
          ...hooksByQuestionId,
          [questionId]: hook,
        }),
        {},
      );
    });
  }
}
