/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { Request, NextFunction, Response } from 'express';
import fs from 'fs';

import { respond, writeJsonFile } from '@tupaia/utils';

// Infers type arguments from request type
/* eslint-disable @typescript-eslint/no-explicit-any */
export type Params<Type> = Type extends Request<infer P, any, any, any> ? P : never;
export type ResBody<Type> = Type extends Request<any, infer sBody, any, any> ? sBody : never;
export type ReqBody<Type> = Type extends Request<any, any, infer qBody, any> ? qBody : never;
export type Query<Type> = Type extends Request<any, any, any, infer Q> ? Q : never;
export type ExpressRequest<Req> = Request<Params<Req>, ResBody<Req>, ReqBody<Req>, Query<Req>>;
export type ExpressResponse<Req> = Response<ResBody<Req>>;
/* eslint-enable @typescript-eslint/no-explicit-any */

type DownloadResBody = {
  contents: string;
  filePath?: string;
  type?: string;
};

type RouteType = 'default' | 'download';

export class Route<
  Req extends ExpressRequest<Req> = Request,
  Res extends ExpressResponse<Req> = Response<ResBody<Req>>
> {
  readonly req: Req;

  readonly res: Res;

  readonly next: NextFunction;

  /**
   * Override in child classes to specify the route type
   */
  protected type: RouteType = 'default';

  constructor(req: Req, res: Res, next: NextFunction) {
    this.req = req;
    this.res = res;
    this.next = next;
  }

  respond(responseBody: ResBody<Req>, statusCode: number) {
    respond(this.res, responseBody, statusCode);
  }

  async handle() {
    // All routes will be wrapped with an error catcher that simply passes the error to the next()
    // function, causing error handling middleware to be fired. Otherwise, async errors will be
    // swallowed.
    try {
      const response = await this.buildResponse();
      if (this.type === 'download') {
        this.download(response);
      } else {
        this.respond(response, 200);
      }
    } catch (error) {
      this.next(error);
    }
  }

  private download = (response: DownloadResBody) => {
    const { filePath = `download_${Date.now()}`, contents, type } = response;

    if (type === '.json') {
      writeJsonFile(filePath, contents);
    } else {
      fs.writeFileSync(filePath, contents);
    }

    this.res.download(filePath, () => {
      fs.unlinkSync(filePath);
    });
  };

  async buildResponse(): Promise<ResBody<Req>> {
    throw new Error('Any Route must implement "buildResponse"');
  }
}
