/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */

import { Route } from './Route';

// Entities endpoint always returns data for all the entities for the same project and entityCode
export class EntityRoute extends Route {
  async buildResponse() {
    const { entityCode } = this.req.params;
    console.log('get entity', entityCode);
    return this.entityConnection?.getEntity(entityCode);
  }
}
