/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 *
 */

import { Request } from 'express';
import { Route } from '@tupaia/server-boilerplate';
import { TupaiaWebExportMapOverlayRequest } from '@tupaia/types';
import { stringifyQuery } from '@tupaia/utils';
import { downloadPageAsPDF } from '@tupaia/server-utils';

export type ExportMapOverlayRequest = Request<
  TupaiaWebExportMapOverlayRequest.Params,
  TupaiaWebExportMapOverlayRequest.ResBody,
  TupaiaWebExportMapOverlayRequest.ReqBody,
  TupaiaWebExportMapOverlayRequest.ReqQuery
>;

const downloadMapOverlayAsPdf = (
  projectCode: string,
  entityCode: string,
  mapOverlayCode: string,
  baseUrl: TupaiaWebExportMapOverlayRequest.ReqBody['baseUrl'],
  cookie: string,
  cookieDomain: TupaiaWebExportMapOverlayRequest.ReqBody['cookieDomain'],
  zoom: TupaiaWebExportMapOverlayRequest.ReqBody['zoom'],
  center: TupaiaWebExportMapOverlayRequest.ReqBody['center'],
  tileset: TupaiaWebExportMapOverlayRequest.ReqBody['tileset'],
  hiddenValues: TupaiaWebExportMapOverlayRequest.ReqBody['hiddenValues'],
) => {
  const endpoint = `${projectCode}/${entityCode}/map-overlay-pdf-export`;
  const pdfPageUrl = stringifyQuery(baseUrl, endpoint, {
    zoom,
    center,
    tileset,
    hiddenValues,
    overlay: mapOverlayCode,
  });

  return downloadPageAsPDF(pdfPageUrl, cookie, cookieDomain, true);
};

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
