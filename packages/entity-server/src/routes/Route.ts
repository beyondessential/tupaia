/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import { Request, NextFunction, Response } from 'express';
import { respond } from '@tupaia/utils';

type ResBody<Type> = Type extends Response<infer Body> ? Body : null; // Infers body of response type

export class Route<Req extends Request = Request, Res extends Response = Response> {
  readonly req: Req;

  readonly res: Res;

  readonly next: NextFunction;

  constructor(req: Req, res: Res, next: NextFunction) {
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

  async buildResponse(): Promise<ResBody<Res>> {
    throw new Error('Any Route must implement "buildResponse"');
  }
}
