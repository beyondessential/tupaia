/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */

import { Route } from './Route';

export class TestRoute extends Route {
  async buildResponse() {
    return { hello: 'world' };
  }
}
