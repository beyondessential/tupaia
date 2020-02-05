/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 **/

import { DatabaseModel, DatabaseType, TYPES } from '@tupaia/database';

class QuestionType extends DatabaseType {
  static databaseType = TYPES.QUESTION;
}

export class QuestionModel extends DatabaseModel {
  get DatabaseTypeClass() {
    return QuestionType;
  }
}
