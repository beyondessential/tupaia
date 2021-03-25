/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */

import { Route } from './Route';

// Entities endpoint always returns data for all the entities for the same project and entityCode
export class EntitiesRoute extends Route {
  async buildResponse() {
    return this.entityConnection?.getEntities();
  }
}
