/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import camelcaseKeys from 'camelcase-keys';
import { Route } from '@tupaia/server-boilerplate';

export class UserRoute extends Route {
  public async buildResponse() {
    const user = await this.req.ctx.services.central.getUser();
    return {
      ...camelcaseKeys(user),
    };
  }
}
