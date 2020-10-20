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
    gaEvent('Export', 'png', 'Attempt');
    domtoimage.toPng(node).then(async dataUrl => {
      downloadJs(dataUrl, `${filename}.png`);
      gaEvent('Export', 'png', 'Success');
      resolve();
    });
  });
};

export const exportToExcel = async ({ projectCode, viewContent, startDate, endDate, filename }) => {
  const { viewId, organisationUnitCode, dashboardGroupId } = viewContent;
  const dataElementHeader = viewContent?.exportConfig?.dataElementHeader;
  gaEvent('Export', 'xlsx', 'Success');

  const queryString = new URLSearchParams({
    dashboardGroupId,
    organisationUnitCode,
    viewId,
    projectCode,
    startDate,
    endDate,
    dataElementHeader,
  });

  await download(`export/chart?${queryString}`, null, null, `${filename}.xlsx`);
  gaEvent('Export', 'xlsx', 'Success');
  return true;
};
