/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */

import { Route } from './Route';

export class EntityRoute extends Route {
  async buildResponse() {
    const { entityCode } = this.req.params;
    return this.entityConnection?.getEntity(entityCode);
  }
}
