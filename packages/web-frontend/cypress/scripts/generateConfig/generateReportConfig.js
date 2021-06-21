/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { uniq } from 'lodash';
import moment from 'moment';

import { compareAsc, hasContent, isAString, ObjectValidator, stringifyQuery } from '@tupaia/utils';
import { convertDateRangeToUrlPeriodString } from '../../../src/historyNavigation/utils';
import config from '../../config.json';
import { readJsonFile } from './helpers';

const objectUrlSchema = {
  id: [hasContent, isAString],
  project: [hasContent, isAString],
  orgUnit: [hasContent, isAString],
  dashboardGroup: [hasContent, isAString],
};

const objectUrlValidator = new ObjectValidator(objectUrlSchema);

const buildReportPeriod = (startDate, endDate) => {
  if (!startDate || !endDate) {
    return undefined;
  }
  return convertDateRangeToUrlPeriodString({
    startDate: moment(startDate),
    endDate: moment(endDate),
  });
};

const buildUrl = urlInput => {
  if (typeof urlInput === 'string') {
    return urlInput;
  }

  const constructError = (errorMessage, key) =>
    new Error(`Invalid content for field "${key}" of object url with id "${id}": ${errorMessage}`);
  objectUrlValidator.validateSync(urlInput, constructError);

  const { id, project, orgUnit, dashboardGroup, startDate, endDate } = urlInput;
  const path = [project, orgUnit, dashboardGroup].map(encodeURIComponent).join('/');
  const queryParams = { report: id, reportPeriod: buildReportPeriod(startDate, endDate) };

  return stringifyQuery('', path, queryParams);
};

export const generateReportConfig = () => {
  const { dashboardReports: reportConfig } = config;

  const { urlFiles = [], urls = [], ...otherConfig } = reportConfig;
  const urlsFromFiles = urlFiles.map(readJsonFile).flat();
  const allUrls = [...urlsFromFiles, ...urls];

  return {
    ...otherConfig,
    urls: uniq(allUrls.map(buildUrl)).sort(compareAsc),
  };
};
