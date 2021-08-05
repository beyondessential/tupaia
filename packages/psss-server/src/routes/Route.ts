/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import { NextFunction, Response } from 'express';
import { respond, PermissionsError, UnauthenticatedError } from '@tupaia/utils';

import { PsssRequest, PsssResponseBody, SessionCookie } from '../types';
import { PsssSessionModel, PsssSessionType } from '../models';
import { EntityConnection, MeditrakConnection, ReportConnection } from '../connections';
import { PSSS_PERMISSION_GROUP } from '../constants';

export class Route {
  req: PsssRequest;

  res: Response;

  next: NextFunction;

  sessionModel: PsssSessionModel;

  sessionCookie?: SessionCookie;

  session!: PsssSessionType;

  entityConnection?: EntityConnection;

  meditrakConnection?: MeditrakConnection;

  reportConnection?: ReportConnection;

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
      this.entityConnection = new EntityConnection(session);
      this.meditrakConnection = new MeditrakConnection(session);
      this.reportConnection = new ReportConnection(session);
      const response = await this.buildResponse();
      this.respond(response, 200);
    } catch (error) {
      this.next(error);
    }
  }

  async getSession() {
    const sessionId = this.sessionCookie?.id;
    if (!sessionId) {
      throw new UnauthenticatedError('Session not found or has expired. Please log in again.');
    }

    const session: PsssSessionType = await this.sessionModel.findById(sessionId);
    if (!session) {
      throw new UnauthenticatedError('Session not found in database');
    }

    return session;
  }

  async verifyAuth(): Promise<PsssSessionType> {
    const session = await this.getSession();
    const { accessPolicy } = session;
    const authorized = accessPolicy.allowsAnywhere(PSSS_PERMISSION_GROUP);
    if (!authorized) {
      throw new PermissionsError('User not authorized for PSSS');
    }

    return session;
  }

  async buildResponse(): Promise<Record<string, unknown>> {
    throw new Error('Any Route must implement "buildResponse"');
  }
}
