/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { Route } from './Route';
import { FetchEntityRequest } from './requests';
import { FetchEntityResponse } from './responses';

export class FetchEntityRoute extends Route<FetchEntityRequest, FetchEntityResponse> {
  async buildResponse() {
    return this.res.context.formatEntityForResponse(this.req.context.entity);
  }
}
