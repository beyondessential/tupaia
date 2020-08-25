/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseType } from '../DatabaseType';
import { TYPES } from '../types';

class AncestorDescendantRelationType extends DatabaseType {
  static databaseType = TYPES.ANCESTOR_DESCENDANT_RELATION;
}

export class AncestorDescendantRelationModel extends DatabaseModel {
  get DatabaseTypeClass() {
    return AncestorDescendantRelationType;
  }
}
