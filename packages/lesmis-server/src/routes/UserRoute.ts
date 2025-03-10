import { Request } from 'express';
import { Route } from '@tupaia/server-boilerplate';
import { camelKeys } from '@tupaia/utils';
import { hasAdminPanelAccess } from '../utils';

export type UserRequest = Request;

export class UserRoute extends Route<UserRequest> {
  public async buildResponse() {
    if (!this.req.session) {
      return {};
    }

    const user = await this.req.ctx.services.central.getUser();
    return { ...camelKeys(user), hasAdminPanelAccess: hasAdminPanelAccess(user.accessPolicy) };
  }
}
