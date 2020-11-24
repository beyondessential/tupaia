/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import { NextFunction, Response } from 'express';
import { respond } from '@tupaia/utils';
import { PermissionsError, UnauthenticatedError } from '@tupaia/utils';
import { PsssRequest, PsssResponseBody, SessionCookie } from '../types';
import { PsssSessionModel, PsssSessionType } from '../models';

const PSSS_PERMISSION_GROUP = 'PSSS';

export class RouteHandler {
  req: PsssRequest;
  res: Response;
  next: NextFunction;
  sessionModel: PsssSessionModel;
  sessionCookie?: SessionCookie;
  session?: PsssSessionType;

  constructor(req: PsssRequest, res: Response, next: NextFunction) {
    this.req = req;
    this.res = res;
    this.next = next;

    const { sessionModel, sessionCookie } = req;
    this.sessionModel = sessionModel;
    this.sessionCookie = sessionCookie;
  }

  respond(responseBody: PsssResponseBody, statusCode: number) {
    respond(this.res, responseBody, statusCode);
  }

  async handle() {
    // All routes will be wrapped with an error catcher that simply passes the error to the next()
    // function, causing error handling middleware to be fired. Otherwise, async errors will be
    // swallowed.
    try {
      const session = await this.verifyAuth();
      this.session = session;
      const response = await this.buildResponse();
      this.respond(response, 200);
    } catch (error) {
      this.next(error);
    }
  }

  async verifyAuth(): Promise<PsssSessionType | undefined> {
    const sessionId = this.sessionCookie?.id;
    if (!sessionId) {
      throw new UnauthenticatedError('User not authenticated');
    }

    const session: PsssSessionType = await this.sessionModel.findById(sessionId);
    if (!session) {
      throw new UnauthenticatedError('Session not found in database');
    }

    const { accessPolicy } = session;
    const authorized = accessPolicy.allowsAnywhere(PSSS_PERMISSION_GROUP);
    if (!authorized) {
      throw new PermissionsError('User not authorized for PSSS');
    }

    return session;
  }

  async buildResponse(): Promise<{}> {
    throw new Error('Any RouteHandler must implement "buildResponse"');
  }
}
