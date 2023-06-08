// TODO: Stop using get for logout, then delete this whole file

import { Request } from 'express';
import { Route } from '@tupaia/server-boilerplate';

export type TempLogoutRequest = Request<
  any,
  { loggedOut: boolean },
  any,
  any
>;

export class TempLogoutRoute extends Route<TempLogoutRequest> {
  public async buildResponse() {
    const { sessionCookie } = this.req;
    const sessionId = sessionCookie?.id;

    if (sessionId && this.req.sessionModel) {
      await this.req.sessionModel.deleteById(sessionId);
    }

    if (sessionCookie !== undefined) {
      sessionCookie.reset?.();
    }

    return { loggedOut: true };
  }
}
