/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { Route } from '@tupaia/server-boilerplate';
import { formatEntityForResponse } from './format';
import { SingleEntityRequest } from './types';

export class SingleEntityRoute extends Route<SingleEntityRequest> {
  async buildResponse() {
    const { entity, field, fields } = this.req.ctx;
    return formatEntityForResponse(this.req.ctx, entity, field || fields);
  }
}
