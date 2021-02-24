/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import { NextFunction, Response } from 'express';
import { respond, PermissionsError, UnauthenticatedError } from '@tupaia/utils';

import { LesmisRequest, LesmisResponseBody, SessionCookie } from '../types';
import { LesmisSessionModel, LesmisSessionType } from '../models';
import { MeditrakConnection, ReportConnection } from '../connections';
import { LESMIS_PERMISSION_GROUP } from '../constants';

export class Route {
  req: LesmisRequest;

  res: Response;

  next: NextFunction;

  sessionModel: LesmisSessionModel;

  sessionCookie?: SessionCookie;

  session!: LesmisSessionType;

  meditrakConnection?: MeditrakConnection;

  reportConnection?: ReportConnection;

  constructor(req: LesmisRequest, res: Response, next: NextFunction) {
    this.req = req;
    this.res = res;
    this.next = next;

    const { sessionModel, sessionCookie } = req;
    this.sessionModel = sessionModel;
    this.sessionCookie = sessionCookie;
  }

  respond(responseBody: LesmisResponseBody, statusCode: number) {
    respond(this.res, responseBody, statusCode);
  }

  async handle() {
    // All routes will be wrapped with an error catcher that simply passes the error to the next()
    // function, causing error handling middleware to be fired. Otherwise, async errors will be
    // swallowed.
    try {
      const session = await this.verifyAuth();
      this.meditrakConnection = new MeditrakConnection(session);
      this.reportConnection = new ReportConnection(session);
      const response = await this.buildResponse();
      this.respond(response, 200);
    } catch (error) {
      this.next(error);
    }
  }

  async getSession() {
    console.log('this.sessionCookie', this.sessionCookie);
    const sessionId = this.sessionCookie?.id;
    if (!sessionId) {
      throw new UnauthenticatedError('User not authenticated');
    }

    const session: LesmisSessionType = await this.sessionModel.findById(sessionId);
    if (!session) {
      throw new UnauthenticatedError('Session not found in database');
    }

    return session;
  }

  async verifyAuth(): Promise<LesmisSessionType> {
    const session = await this.getSession();
    const { accessPolicy } = session;
    const authorized = accessPolicy.allowsAnywhere(LESMIS_PERMISSION_GROUP);
    if (!authorized) {
      throw new PermissionsError('User not authorized for Lesmis');
    }

    return session;
  }

  async buildResponse(): Promise<Record<string, unknown>> {
    throw new Error('Any Route must implement "buildResponse"');
  }
}
