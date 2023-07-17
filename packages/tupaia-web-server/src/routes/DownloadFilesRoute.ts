/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { Request } from 'express';
import { Route } from '@tupaia/server-boilerplate';

export type DownloadFilesRequest = Request<{ mapOverlayCode: string }, any, any, any>;

export class DownloadFilesRoute extends Route<DownloadFilesRequest> {
  public async buildResponse() {
    const { query, ctx } = this.req;
    const res = this.res;

    console.log('result');
    const result = await ctx.services.central.fetchResources('downloadFiles', query);
    console.log('result', result);

    res.setHeader('content-type', result.headers.get('content-type'));
    res.setHeader('content-disposition', result.headers.get('content-disposition'));
    res.setHeader('content-length', result.headers.get('content-length'));
    return result.body.pipe(res);
  }
}
