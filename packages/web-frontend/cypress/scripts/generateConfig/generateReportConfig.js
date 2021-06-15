/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import fs from 'fs';
import { uniq } from 'lodash';
import moment from 'moment';

import { compareAsc, getLoggerInstance, ObjectValidator, stringifyQuery } from '@tupaia/utils';
import cypressConfig from '../../../cypress.json';
import { convertDateRangeToUrlPeriodString } from '../../../src/historyNavigation/utils';

const CONFIG_PATH = 'cypress/config/dashboardReports.json';

const readJsonFile = path => JSON.parse(fs.readFileSync(path, { encoding: 'utf-8' }));

const writeJsonFile = (path, json) => fs.writeFileSync(path, JSON.stringify(json, null, 2));

const isNonEmptyArray = input => Array.isArray(input) && input.length > 0;

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

const buildUrl = urlObject => {
  const { id, project, orgUnit, dashboardGroup, startDate, endDate } = urlObject;

  const constructError = (message, key) =>
    new Error(`Params error in field "${key}" for report "${id}": ${message}`);
  reportParamsValidator.validateSync(urlObject, constructError);

  const path = [project, orgUnit, dashboardGroup].map(encodeURIComponent).join('/');
  const queryParams = { report: id, reportPeriod: buildReportPeriod(startDate, endDate) };

  return stringifyQuery('', path, queryParams);
};

const getUrlObjects = () => {
  const { dashboardReportParamFiles } = cypressConfig?.tupaia;
  if (!isNonEmptyArray(dashboardReportParamFiles)) {
    throw new Error('Field `tupaia.dashboardReportParamFiles` must be a non empty array');
  }

  return dashboardReportParamFiles.map(readJsonFile).flat();
};

export const generateReportConfig = () => {
  const logger = getLoggerInstance();

  const urlObjects = getUrlObjects();
  const urls = uniq(urlObjects.map(buildUrl)).sort(compareAsc);
  const config = readJsonFile(CONFIG_PATH);
  const newConfig = { ...config, urls };
  writeJsonFile(CONFIG_PATH, newConfig);

  logger.info(`Generated ${urls.length} report urls in "${CONFIG_PATH}"`);
};
