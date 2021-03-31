/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { EntityResponseObject, ExtendedEntityFields } from '../types';

type Writable<T> = { -readonly [field in keyof T]?: T[field] };
export class EntityResponseObjectBuilder {
  private readonly responseObject: Writable<EntityResponseObject> = {};

  set<T extends keyof ExtendedEntityFields>(field: T, value: EntityResponseObject[T]) {
    this.responseObject[field] = value;
  }

  build() {
    return this.responseObject as EntityResponseObject;
  }
}
