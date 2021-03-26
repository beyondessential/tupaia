/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import { Request, Response, NextFunction } from 'express';
import { UnauthenticatedError } from '@tupaia/utils';
import {
  Route as BaseRoute,
  MatchingResponse,
  Params,
  ReqBody,
  ResBody,
  Query,
} from '../../routes';
import { SessionCookie } from '../types';
import { SessionModel, SessionType } from '../models/Session';

export abstract class Route<
  Req extends Request<Params<Req>, ResBody<Req>, ReqBody<Req>, Query<Req>> = Request,
  Res extends MatchingResponse<Req> = Response
> extends BaseRoute<Req, Res> {
  sessionModel: SessionModel;

  sessionCookie?: SessionCookie;

  constructor(req: Req, res: Res, next: NextFunction) {
    super(req, res, next);

    const { sessionModel, sessionCookie } = req;
    this.sessionModel = sessionModel;
    this.sessionCookie = sessionCookie;
  }

  async handle() {
    // All routes will be wrapped with an error catcher that simply passes the error to the next()
    // function, causing error handling middleware to be fired. Otherwise, async errors will be
    // swallowed.
    try {
      await this.setupConnections();
    } catch (error) {
      this.next(error);
    }

    await super.handle();
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

  // optional method to setup additional api connections
  setupConnections(): void {}
}
