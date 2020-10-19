/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import domtoimage from '../dom-to-image';
import downloadJs from 'downloadjs';
import { download } from './request';

export const exportToPng = node => {
  return new Promise(resolve => {
    domtoimage.toPng(node).then(async dataUrl => {
      downloadJs(dataUrl, 'exported-chart.png');
      resolve();
    });
  });
};

export const exportToExcel = async ({ projectCode, viewContent, startDate, endDate }) => {
  const { viewId, organisationUnitCode, dashboardGroupId, chartType } = viewContent;

  console.log('start...');

  const queryString = new URLSearchParams({
    dashboardGroupId,
    organisationUnitCode,
    viewId,
    projectCode,
    startDate,
    endDate,
  });

  const url = `export/chart?${queryString}`;
  const exportFileName = chartType ? `tupaia-export-${chartType}.xlsx` : 'tupaia-export.xlsx';
  await download(url, null, null, exportFileName);
};
