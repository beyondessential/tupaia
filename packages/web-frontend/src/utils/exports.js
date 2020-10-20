/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import downloadJs from 'downloadjs';
import domtoimage from 'dom-to-image';
import { download } from './request';

export const exportToPng = (node, filename) => {
  return new Promise(resolve => {
    domtoimage.toPng(node).then(async dataUrl => {
      downloadJs(dataUrl, `${filename}.png`);
      resolve();
    });
  });
};

export const exportToExcel = async ({ projectCode, viewContent, startDate, endDate, filename }) => {
  const { viewId, organisationUnitCode, dashboardGroupId } = viewContent;
  const dataElementHeader = viewContent?.exportConfig?.dataElementHeader;

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
  return true;
};
