/* eslint-disable no-template-curly-in-string */

import { stringifyQuery, yup } from '@tupaia/utils';
import config from '../../config.json';
import { buildUrlSchema, buildUrlsUsingConfig, buildVizPeriod, sortUrls } from './helpers';

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

const stringifyUrl = url => {
  if (typeof url === 'string') {
    return url;
  }

  const { code, project, orgUnit, dashboard, startDate, endDate, reportPeriod } = url;
  const path = [project, orgUnit, dashboard].map(encodeURIComponent).join('/');
  const queryParams = {
    report: code,
    reportPeriod: reportPeriod || buildVizPeriod(startDate, endDate),
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
  const [project, orgUnit, dashboard] = path
    .split('/')
    .filter(x => x !== '')
    .map(decodeURIComponent);

  return {
    code: searchParams.get('report'),
    project,
    orgUnit,
    dashboard,
    reportPeriod: searchParams.get('reportPeriod'),
  };
};

export const generateReportConfig = async () => {
  const { dashboardReports: reportConfig } = config;

  const urls = await buildUrlsUsingConfig(reportConfig);
  const objectUrls = urls.map(parseUrl);

  return {
    allowEmptyResponse: reportConfig.allowEmptyResponse,
    snapshotTypes: reportConfig.snapshotTypes,
    urls: sortUrls(objectUrls.map(stringifyUrl)),
  };
};
