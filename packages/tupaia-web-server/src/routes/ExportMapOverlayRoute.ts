/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 *
 */

import { Request } from 'express';
import { Route } from '@tupaia/server-boilerplate';
import { TupaiaWebExportMapOverlayRequest } from '@tupaia/types';
import { downloadMapOverlayAsPdf } from '../utils';

export type ExportMapOverlayRequest = Request<
  TupaiaWebExportMapOverlayRequest.Params,
  TupaiaWebExportMapOverlayRequest.ResBody,
  TupaiaWebExportMapOverlayRequest.ReqBody,
  TupaiaWebExportMapOverlayRequest.ReqQuery
>;

export class ExportMapOverlayRoute extends Route<ExportMapOverlayRequest> {
  protected type = 'download' as const;

  public async buildResponse() {
    const { projectCode, entityCode, mapOverlayCode } = this.req.params;
    const { baseUrl, cookieDomain, zoom, center, tileset, hiddenValues } = this.req.body;
    const { cookie } = this.req.headers;

    if (!cookie) {
      throw new Error(`Must have a valid session to export a dashboard`);
    }

    const buffer = await downloadMapOverlayAsPdf(
      projectCode,
      entityCode,
      mapOverlayCode,
      baseUrl,
      cookie,
      cookieDomain,
      zoom,
      center,
      tileset,
      hiddenValues,
    );
    return { contents: buffer, type: 'application/pdf' };
  }
}
