/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { UnauthenticatedRoute } from '@tupaia/server-boilderplate';

export class TestRoute extends UnauthenticatedRoute {
  async buildResponse() {
    return { hello: 'world' };
  }
}
