/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseType } from '../DatabaseType';
import { TYPES } from '../types';

class EntityRelationType extends DatabaseType {
  static databaseType = TYPES.ENTITY_RELATION;
}

export class EntityRelationModel extends DatabaseModel {
  get DatabaseTypeClass() {
    return EntityRelationType;
  }
}
