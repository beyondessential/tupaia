/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import camelcaseKeys from 'camelcase-keys';
import { Route } from '@tupaia/server-boilerplate';
import { AccessPolicy } from '@tupaia/access-policy';
import { BES_ADMIN_PERMISSION_GROUP } from '../constants';

const isBESAdmin = (policy: Record<string, string[]>) => {
  return new AccessPolicy(policy).allowsSome(undefined, BES_ADMIN_PERMISSION_GROUP);
};

export class UserRoute extends Route {
  public async buildResponse() {
    const user = await this.req.ctx.services.central.getUser();
    return { ...camelcaseKeys(user), isBESAdmin: isBESAdmin(user.accessPolicy) };
  }
}
