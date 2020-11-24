/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import { NextFunction, Response } from 'express';
import { respond } from '@tupaia/utils';
import { PsssRequest, PsssResponseBody } from '../types';
import { PsssSessionModel, PsssSessionType } from '../models';

export class RouteHandler {
  req: PsssRequest;
  res: Response;
  next: NextFunction;
  sessionModel: PsssSessionModel;
  session?: PsssSessionType;

  constructor(req: PsssRequest, res: Response, next: NextFunction) {
    this.req = req;
    this.res = res;
    this.next = next;

    const { sessionModel, session } = req;
    this.sessionModel = sessionModel;
    this.session = session;
  }

  respond(responseBody: PsssResponseBody, statusCode: number) {
    respond(this.res, responseBody, statusCode);
  }

  async handle() {
    // All routes will be wrapped with an error catcher that simply passes the error to the next()
    // function, causing error handling middleware to be fired. Otherwise, async errors will be
    // swallowed.
    const handlerPromise = this.handleRequest();
    handlerPromise.catch((error: Error) => this.next(error));
    return handlerPromise;
  }

  async handleRequest() {
    throw new Error('Any RouteHandler must implement "handleRequest"');
  }
}
