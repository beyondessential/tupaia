/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */

import { Route } from './Route';

export class UserRoute extends Route {
  async buildResponse() {
    return this.meditrakConnection?.getUser();
  }
}
