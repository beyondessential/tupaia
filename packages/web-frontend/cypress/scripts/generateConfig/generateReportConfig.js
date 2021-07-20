/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

/* eslint-disable no-template-curly-in-string */

import moment from 'moment';

import { stringifyQuery, yup } from '@tupaia/utils';
import { convertDateRangeToUrlPeriodString } from '../../../src/historyNavigation/utils';
import config from '../../config.json';
import { buildUrlSchema, buildUrlsUsingConfig, sortUrls } from './helpers';
import { DashboardReportFilter } from './VisualisationFilter';

const urlSchema = buildUrlSchema({
  regex: new RegExp('^/[^/]+/[^/]+/[^/]+?.*report=.+'),
  regexDescription: '/:projectCode/:orgUnit/:dashboardName?report=:reportCode',
  shape: {
    code: yup.string().required(),
    project: yup.string().required(),
    orgUnit: yup.string().required(),
    dashboard: yup.string().required(),
    startDate: yup.string(),
    endDate: yup.string(),
  },
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

const stringifyUrl = url => {
  if (typeof url === 'string') {
    return url;
  }

  const { code, project, orgUnit, dashboard, startDate, endDate, reportPeriod } = url;
  const path = [project, orgUnit, dashboard].map(encodeURIComponent).join('/');
  const queryParams = {
    report: code,
    reportPeriod: reportPeriod || buildReportPeriod(startDate, endDate),
  };

  return stringifyQuery('', path, queryParams);
};

const parseUrl = url => {
  urlSchema.validateSync(url, { strict: true });

  if (typeof url === 'object') {
    return url;
  }

  const [path, queryParams] = url.split('?');
  const searchParams = new URLSearchParams(queryParams);
  const [project, orgUnit, dashboard] = path.split('/').filter(x => x !== '');

  return {
    code: searchParams.get('report'),
    project,
    orgUnit,
    dashboard,
    reportPeriod: searchParams.get('reportPeriod'),
  };
};

export const generateReportConfig = async db => {
  const { dashboardReports: reportConfig } = config;
  const { filter = {} } = reportConfig;

  const urls = await buildUrlsUsingConfig(db, reportConfig);
  const objectUrls = urls.map(parseUrl);
  const filteredObjectUrls = await new DashboardReportFilter(db, filter).apply(objectUrls);

  return {
    allowEmptyResponse: reportConfig.allowEmptyResponse,
    snapshotTypes: reportConfig.snapshotTypes,
    urls: sortUrls(filteredObjectUrls.map(stringifyUrl)),
  };
};
