/**
 * Tupaia MediTrak
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 **/

import { DatabaseType } from '../DatabaseType';
import { TYPES } from '..';
import { DatabaseModel } from '../DatabaseModel';

class EntityRelationType extends DatabaseType {
  static databaseType = TYPES.ENTITY_RELATION;

  async getFromEntity() {
    return this.otherModels.entity.findById(this.from_id);
  }

  async getToEntity() {
    return this.otherModels.entity.findById(this.to_id);
  }
}

export class EntityRelationModel extends DatabaseModel {
  get DatabaseTypeClass() {
    return EntityRelationType;
  }
}
