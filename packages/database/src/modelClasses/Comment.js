/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseType } from '../DatabaseType';
import { TYPES } from '../types';

export class CommentType extends DatabaseType {
  static databaseType = TYPES.COMMENT;
}

export class CommentModel extends DatabaseModel {
  get DatabaseTypeClass() {
    return CommentType;
  }
}
