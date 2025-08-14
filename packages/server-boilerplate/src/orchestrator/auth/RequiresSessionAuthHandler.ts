import { Request } from 'express';
import { UnauthenticatedError } from '@tupaia/utils';
import { AuthHandler } from '@tupaia/api-client';
import { SessionRecord } from '../models';

// Requires a session and throws an error if attempting to getAuthHeader when no session is present
export class RequiresSessionAuthHandler implements AuthHandler {
  private req: Request;
  private session?: SessionRecord;

  public constructor(req: Request) {
    this.req = req;
  }

  private async getSession() {
    // We let this resolve undefined if there's no current session
    if (!this.session) {
      const sessionId = this.req.sessionCookie?.id;
      if (sessionId) {
        this.session = await this.req.sessionModel.findById(sessionId);
      }
    }

    return this.session;
  }

  public async getAuthHeader() {
    await this.getSession();

    if (!this.session) {
      throw new UnauthenticatedError('Session is not attached');
    }

    return this.session.getAuthHeader(this.req);
  }
}
