/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import { Request, NextFunction, Response } from 'express';
import { respond } from '@tupaia/utils';

// Infers type arguments from request type
/* eslint-disable @typescript-eslint/no-explicit-any */
type Params<Type> = Type extends Request<infer P, any, any, any> ? P : null;
type ResBody<Type> = Type extends Request<any, infer sBody, any, any> ? sBody : null;
type ReqBody<Type> = Type extends Request<any, any, infer qBody, any> ? qBody : null;
type Query<Type> = Type extends Request<any, any, any, infer Q> ? Q : null;
/* eslint-enable @typescript-eslint/no-explicit-any */

export class Route<
  Req extends Request<Params<Req>, ResBody<Req>, ReqBody<Req>, Query<Req>> = Request,
  Res extends Response<ResBody<Req>> = Response
> {
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

  async buildResponse(): Promise<ResBody<Req>> {
    throw new Error('Any Route must implement "buildResponse"');
  }
}
