import { Request } from 'express';
import { createBasicHeader, getEnvVarOrDefault } from '@tupaia/utils';
import { AuthHandler } from '@tupaia/api-client';
import { SessionRecord } from '../models';

// Handles switching between microservice client and user login sessions
export class SessionSwitchingAuthHandler implements AuthHandler {
  private req: Request;
  private session?: SessionRecord;

  // AuthHandlers are run before the session is attached to the request
  // So we unfortunately need to fetch it separately here
  public constructor(req: Request) {
    // Save out the request so we can use the attached models later
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

    if (this.session) {
      return this.session.getAuthHeader(this.req);
    }

    return createBasicHeader(
      getEnvVarOrDefault('API_CLIENT_NAME', ''),
      getEnvVarOrDefault('API_CLIENT_PASSWORD', ''),
    );
  }
}
