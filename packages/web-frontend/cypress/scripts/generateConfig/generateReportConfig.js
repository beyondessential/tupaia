/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import moment from 'moment';

import { hasContent, isAString, ObjectValidator, stringifyQuery } from '@tupaia/utils';
import { convertDateRangeToUrlPeriodString } from '../../../src/historyNavigation/utils';
import config from '../../config.json';
import { buildUrlsUsingConfig, sortUrls, validateFilter } from './helpers';
import { DashboardReportFilter } from './VisualisationFilter';

const objectUrlSchema = {
  id: [hasContent, isAString],
  project: [hasContent, isAString],
  orgUnit: [hasContent, isAString],
  dashboardGroup: [hasContent, isAString],
};
const objectUrlValidator = new ObjectValidator(objectUrlSchema);

const FILTER_FIELDS = [...Object.keys(objectUrlSchema), 'dataBuilder'];

const buildReportPeriod = (startDate, endDate) => {
  if (!startDate || !endDate) {
    return undefined;
  }
  return convertDateRangeToUrlPeriodString({
    startDate: moment(startDate),
    endDate: moment(endDate),
  });
};

const stringifyUrl = url => {
  if (typeof url === 'string') {
    return url;
  }

  const constructError = (errorMessage, key) =>
    new Error(`Invalid content for field "${key}" of object url with id "${id}": ${errorMessage}`);
  objectUrlValidator.validateSync(url, constructError);

  const { id, project, orgUnit, dashboardGroup, startDate, endDate } = url;
  const path = [project, orgUnit, dashboardGroup].map(encodeURIComponent).join('/');
  const queryParams = { report: id, reportPeriod: buildReportPeriod(startDate, endDate) };

  return stringifyQuery('', path, queryParams);
};

const objectifyUrl = url => {
  if (typeof url === 'object') {
    return url;
  }

  const [path, queryParams] = url.split('?');
  const searchParams = new URLSearchParams(queryParams);
  const [project, orgUnit, dashboardGroup] = path.split('/').filter(x => x !== '');

  const objectUrl = {
    id: searchParams.get('report'),
    project,
    orgUnit,
    dashboardGroup,
    startDate: searchParams.get('startDate'),
    endDate: searchParams.get('endDate'),
  };

  const constructError = (errorMessage, key) =>
    new Error(`Invalid content for component "${key}" of url "${url}": ${errorMessage}`);
  objectUrlValidator.validateSync(objectUrl, constructError);

  return objectUrl;
};

export const generateReportConfig = async db => {
  const { dashboardReports: reportConfig } = config;
  const { filter = {}, urlFiles, urlGenerationOptions, ...otherFields } = reportConfig;
  validateFilter(filter, FILTER_FIELDS);

  const urls = await buildUrlsUsingConfig(db, reportConfig);
  const objectUrls = urls.map(objectifyUrl);
  const filteredObjectUrls = await new DashboardReportFilter(db, filter).apply(objectUrls);

  return {
    ...otherFields,
    urls: sortUrls(filteredObjectUrls.map(stringifyUrl)),
  };
};
