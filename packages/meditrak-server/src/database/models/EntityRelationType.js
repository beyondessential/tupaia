/**
 * Tupaia MediTrak
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 **/

import { DatabaseModel, DatabaseType, TYPES } from '@tupaia/database';

class EntityRelationTypeType extends DatabaseType {
  static databaseType = TYPES.ENTITY_RELATION_TYPE;
}

export class EntityRelationTypeModel extends DatabaseModel {
  get DatabaseTypeClass() {
    return EntityRelationTypeType;
  }
}
