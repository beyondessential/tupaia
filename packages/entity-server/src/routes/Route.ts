/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import { Request, NextFunction, Response } from 'express';
import { respond } from '@tupaia/utils';

export class Route {
  req: Request;

  res: Response;

  next: NextFunction;

  constructor(req: Request, res: Response, next: NextFunction) {
    this.req = req;
    this.res = res;
    this.next = next;
  }

  respond(responseBody: Record<string, unknown>, statusCode: number) {
    respond(this.res, responseBody, statusCode);
  }

  async handle() {
    // All routes will be wrapped with an error catcher that simply passes the error to the next()
    // function, causing error handling middleware to be fired. Otherwise, async errors will be
    // swallowed.
    try {
      const response = await this.buildResponse();
      this.respond(response, 200);
    } catch (error) {
      this.next(error);
    }
  }

  async buildResponse(): Promise<Record<string, unknown>> {
    throw new Error('Any Route must implement "buildResponse"');
  }
}
