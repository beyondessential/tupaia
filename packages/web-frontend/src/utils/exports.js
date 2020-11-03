/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import downloadJs from 'downloadjs';
import domtoimage from 'dom-to-image';
import { download } from './request';
import { gaEvent } from './ga';

export const exportToPng = (node, filename) => {
  return new Promise(resolve => {
    const file = `${filename}.png`;

    gaEvent('Export', file, 'Attempt');

    domtoimage.toPng(node).then(async dataUrl => {
      downloadJs(dataUrl, file);
      gaEvent('Export', file, 'Success');
      resolve();
    });
  });
};

export const exportToExcel = async ({ projectCode, viewContent, startDate, endDate, filename }) => {
  const { viewId, organisationUnitCode, dashboardGroupId } = viewContent;
  const dataElementHeader = viewContent?.exportConfig?.dataElementHeader;
  const file = `${filename}.xlsx`;

  gaEvent('Export', file, 'Attempt');

  const queryString = new URLSearchParams({
    dashboardGroupId,
    organisationUnitCode,
    viewId,
    projectCode,
    startDate,
    endDate,
    dataElementHeader,
  });

  await download(`export/chart?${queryString}`, null, null, file);
  gaEvent('Export', file, 'Success');
  return true;
};
