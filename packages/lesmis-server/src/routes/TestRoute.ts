/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { UnauthenticatedRoute } from './UnauthenticatedRoute';

export class TestRoute extends UnauthenticatedRoute {
  async buildResponse() {
    return { hello: 'world' };
  }
}
