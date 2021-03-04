/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import { NextFunction, Response } from 'express';
import { respond, UnauthenticatedError } from '@tupaia/utils';

import { TupaiaRequest, TupaiaResponseBody, SessionCookie } from './types';
import { SessionModel, SessionType } from './Session';

export class Route {
  req: TupaiaRequest;

  res: Response;

  next: NextFunction;

  sessionModel: SessionModel;

  sessionCookie?: SessionCookie;

  constructor(req: TupaiaRequest, res: Response, next: NextFunction) {
    this.req = req;
    this.res = res;
    this.next = next;

    const { sessionModel, sessionCookie } = req;
    this.sessionModel = sessionModel;
    this.sessionCookie = sessionCookie;
  }

  respond(responseBody: TupaiaResponseBody, statusCode: number) {
    respond(this.res, responseBody, statusCode);
  }

  async handle() {
    // All routes will be wrapped with an error catcher that simply passes the error to the next()
    // function, causing error handling middleware to be fired. Otherwise, async errors will be
    // swallowed.
    try {
      const session = await this.verifyAuth();
      const response = await this.buildResponse();
      this.respond(response, 200);
    } catch (error) {
      this.next(error);
    }
  }

  async getSession() {
    const sessionId = this.sessionCookie?.id;
    if (!sessionId) {
      throw new UnauthenticatedError('User not authenticated');
    }

    const session: SessionType = await this.sessionModel.findById(sessionId);
    if (!session) {
      throw new UnauthenticatedError('Session not found in database');
    }

    return session;
  }

  async verifyAuth(): Promise<SessionType> {
    return this.getSession();
  }

  async buildResponse(): Promise<Record<string, unknown>> {
    throw new Error('Any Route must implement "buildResponse"');
  }
}
