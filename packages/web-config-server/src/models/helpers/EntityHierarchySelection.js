/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import { reduceToDictionary } from '@tupaia/utils';

export class EntityHierarchySelection {
  constructor(entities, childToParentMap) {
    this.entities = entities;
    this.childToParentMap = childToParentMap || reduceToDictionary(entities, 'id', 'parent_id');
  }

  getEntities() {
    return this.entities;
  }

  getChildToParentMap() {
    return this.childToParentMap;
  }
}
