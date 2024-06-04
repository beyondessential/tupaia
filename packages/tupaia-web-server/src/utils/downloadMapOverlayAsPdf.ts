/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { downloadPageAsPDF } from '@tupaia/server-utils';
import { TupaiaWebExportMapOverlayRequest } from '@tupaia/types';
import { stringifyQuery } from '@tupaia/utils';

export const downloadMapOverlayAsPdf = (
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
