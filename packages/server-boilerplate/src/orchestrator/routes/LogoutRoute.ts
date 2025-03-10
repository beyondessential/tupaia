import { Request } from 'express';
import { Route } from '../../routes';
import { EmptyObject } from '../../types';

export class LogoutRoute extends Route<Request<EmptyObject, { success: boolean }>> {
  public async buildResponse() {
    const { sessionCookie } = this.req;
    const sessionId = sessionCookie?.id;

    if (sessionId && this.req.sessionModel) {
      await this.req.sessionModel.deleteById(sessionId);
    }

    if (sessionCookie !== undefined) {
      sessionCookie.reset?.();
    }

    return { success: true };
  }
}
