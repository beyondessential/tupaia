/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { Writable } from '../../types';

export class ResponseObjectBuilder<T> {
  private readonly responseObject: Writable<T> = {};

  public set<K extends keyof T>(field: K, value: T[K]) {
    this.responseObject[field] = value;
  }

  public build() {
    return this.responseObject as T;
  }
}
