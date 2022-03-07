/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import queryString from 'query-string';
import downloadJs from 'downloadjs';
import domtoimage from 'dom-to-image';
import { download } from './request';
import { gaEvent } from './ga';

export const exportToPng = (node, filename) => {
  return new Promise(resolve => {
    const file = `${filename}.png`;

    gaEvent('Export', file, 'Attempt');

    domtoimage.toPng(node, { bgcolor: 'white' }).then(async dataUrl => {
      downloadJs(dataUrl, file);
      gaEvent('Export', file, 'Success');
      resolve();
    });
  });
};

export const exportToExcel = async ({
  projectCode,
  dashboardCode,
  organisationUnitCode,
  viewContent,
  startDate,
  endDate,
  timeZone,
  filename,
}) => {
  const { code: itemCode, legacy } = viewContent;
  const dataElementHeader = viewContent?.exportConfig?.dataElementHeader;
  const file = `${filename}.xlsx`;

  let newStartDate = startDate;
  let newEndDate = endDate;
  if (!startDate && !endDate) {
    const { startDate: viewStartDate, endDate: viewEndDate } = viewContent;
    newStartDate = viewStartDate;
    newEndDate = viewEndDate;
  }

  gaEvent('Export', file, 'Attempt');

  const queryParameters = {
    dashboardCode,
    organisationUnitCode,
    itemCode,
    projectCode,
    startDate: newStartDate,
    endDate: newEndDate,
    timeZone,
    dataElementHeader,
    legacy,
  };

  await download(`export/chart?${queryString.stringify(queryParameters)}`, null, null, file);
  gaEvent('Export', file, 'Success');
  return true;
};
