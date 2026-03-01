import { Request } from 'express';
import { Route } from '@tupaia/server-boilerplate';
import { TupaiaWebExportMapOverlayRequest } from '@tupaia/types';
import { stringifyQuery } from '@tupaia/utils';
import { downloadPageAsPdf, downloadPageAsImage } from '@tupaia/server-utils';

export type ExportMapOverlayRequest = Request<
  TupaiaWebExportMapOverlayRequest.Params,
  TupaiaWebExportMapOverlayRequest.ResBody,
  TupaiaWebExportMapOverlayRequest.ReqBody,
  TupaiaWebExportMapOverlayRequest.ReqQuery
>;

const buildExportPageUrl = (
  projectCode: string,
  entityCode: string,
  mapOverlayCode: string,
  baseUrl: TupaiaWebExportMapOverlayRequest.ReqBody['baseUrl'],
  zoom: TupaiaWebExportMapOverlayRequest.ReqBody['zoom'],
  center: TupaiaWebExportMapOverlayRequest.ReqBody['center'],
  tileset: TupaiaWebExportMapOverlayRequest.ReqBody['tileset'],
  hiddenValues: TupaiaWebExportMapOverlayRequest.ReqBody['hiddenValues'],
  mapOverlayPeriod?: TupaiaWebExportMapOverlayRequest.ReqBody['mapOverlayPeriod'],
  locale?: TupaiaWebExportMapOverlayRequest.ReqBody['locale'],
) =>
  stringifyQuery(baseUrl, `${projectCode}/${entityCode}/map-overlay-pdf-export`, {
    zoom,
    center,
    tileset,
    hiddenValues,
    overlay: mapOverlayCode,
    overlayPeriod: mapOverlayPeriod,
    locale,
  });

export class ExportMapOverlayRoute extends Route<ExportMapOverlayRequest> {
  protected type = 'download' as const;

  public async buildResponse() {
    const { projectCode, entityCode, mapOverlayCode } = this.req.params;
    const {
      baseUrl,
      cookieDomain,
      zoom,
      center,
      tileset,
      hiddenValues,
      mapOverlayPeriod,
      locale,
      format = 'pdf',
    } = this.req.body;
    const { cookie } = this.req.headers;

    if (!cookie) {
      throw new Error(`Must have a valid session to export a map overlay`);
    }

    const pageUrl = buildExportPageUrl(
      projectCode,
      entityCode,
      mapOverlayCode,
      baseUrl,
      zoom,
      center,
      tileset,
      hiddenValues,
      mapOverlayPeriod,
      locale,
    );

    if (format === 'png') {
      const buffer = await downloadPageAsImage({ cookieDomain, pageUrl, userCookie: cookie });
      return { contents: buffer, type: 'image/png' };
    }

    const buffer = await downloadPageAsPdf({
      cookieDomain,
      landscape: true,
      pdfPageUrl: pageUrl,
      userCookie: cookie,
    });
    return { contents: buffer, type: 'application/pdf' };
  }
}
