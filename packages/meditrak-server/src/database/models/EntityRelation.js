/**
 * Tupaia MediTrak
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 **/

import { DatabaseModel, DatabaseType, TYPES } from '@tupaia/database';

class EntityRelationType extends DatabaseType {
  static databaseType = TYPES.ENTITY_RELATION;
}

export class EntityRelationModel extends DatabaseModel {
  get DatabaseTypeClass() {
    return EntityRelationType;
  }
}
