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
  dashboardName: string,
  baseUrl: TupaiaWebExportMapOverlayRequest.ReqBody['baseUrl'],
  cookie: string,
  cookieDomain: TupaiaWebExportMapOverlayRequest.ReqBody['cookieDomain'],
  bounds: TupaiaWebExportMapOverlayRequest.ReqBody['bounds'],
  basemap: TupaiaWebExportMapOverlayRequest.ReqBody['basemap'],
  hiddenValues: TupaiaWebExportMapOverlayRequest.ReqBody['hiddenValues'],
) => {
  const endpoint = `${projectCode}/${entityCode}/${dashboardName}/map-overlay-pdf-export`;
  const pdfPageUrl = stringifyQuery(baseUrl, endpoint, {
    bounds: JSON.stringify(bounds),
    basemap,
    hiddenValues: JSON.stringify(hiddenValues),
  });

  return downloadPageAsPDF(pdfPageUrl, cookie, cookieDomain);
};
