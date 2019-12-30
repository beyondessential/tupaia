/**
 * Tupaia MediTrak
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 **/

import { DatabaseType } from '../DatabaseType';
import { TYPES } from '..';
import { DatabaseModel } from '../DatabaseModel';

class EntityRelationTypeType extends DatabaseType {
  static databaseType = TYPES.ENTITY_RELATION_TYPE;
}

export class EntityRelationTypeModel extends DatabaseModel {
  get DatabaseTypeClass() {
    return EntityRelationTypeType;
  }
}
