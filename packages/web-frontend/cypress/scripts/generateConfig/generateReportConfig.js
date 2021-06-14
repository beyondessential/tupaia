/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import fs from 'fs';
import moment from 'moment';

import { compareAsc, getLoggerInstance, ObjectValidator, stringifyQuery } from '@tupaia/utils';
import { convertDateRangeToUrlPeriodString } from '../../../src/historyNavigation/utils';
import allReportParams from '../../config/params/dashboardReports.json';

const CONFIG_PATH = 'cypress/config/dashboardReports.json';

const readJsonFile = path => JSON.parse(fs.readFileSync(path, { encoding: 'utf-8' }));

const writeJsonFile = (path, json) => fs.writeFileSync(path, JSON.stringify(json, null, 2));

const isNonEmptyString = value => {
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error('Should be a non empty string');
  }
};

const reportParamsValidator = new ObjectValidator({
  id: [isNonEmptyString],
  project: [isNonEmptyString],
  orgUnit: [isNonEmptyString],
  dashboardGroup: [isNonEmptyString],
});

const buildReportPeriod = (startDate, endDate) => {
  if (!startDate || !endDate) {
    return undefined;
  }
  return convertDateRangeToUrlPeriodString({
    startDate: moment(startDate),
    endDate: moment(endDate),
  });
};

const buildUrl = params => {
  const { id, project, orgUnit, dashboardGroup, startDate, endDate } = params;

  const constructError = (message, key) =>
    new Error(`Params error in field "${key}" for report "${id}": ${message}`);
  reportParamsValidator.validateSync(params, constructError);

  const path = [project, orgUnit, dashboardGroup].map(encodeURIComponent).join('/');
  const queryParams = { report: id, reportPeriod: buildReportPeriod(startDate, endDate) };

  return stringifyQuery('', path, queryParams);
};

export const generateReportConfig = () => {
  const logger = getLoggerInstance();

  const urls = allReportParams.map(buildUrl).sort(compareAsc);
  const config = readJsonFile(CONFIG_PATH);
  const newConfig = { ...config, urls };
  writeJsonFile(CONFIG_PATH, newConfig);

  logger.info(`Generated ${urls.length} report urls in "${CONFIG_PATH}"`);
};
