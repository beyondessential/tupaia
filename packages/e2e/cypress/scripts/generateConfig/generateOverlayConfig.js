import { groupBy } from 'es-toolkit/compat';

import { stringifyQuery, toArray, yup, yupUtils } from '@tupaia/utils';
import config from '../../config.json';
import { buildUrlSchema, buildUrlsUsingConfig, buildVizPeriod, sortUrls } from './helpers';

const { oneOrArrayOf } = yupUtils;

const urlSchema = buildUrlSchema({
  regex: new RegExp('^/[^/]+/[^/]+?.*overlay=.+'),
  regexDescription: '/:projectCode/:orgUnit?overlay=:overlayId',
  shape: {
    id: oneOrArrayOf(yup.string().required()),
    project: yup.string().required(),
    orgUnit: yup.string().required(),
    startDate: yup.string(),
    endDate: yup.string(),
  },
});

const removeRedundantObjectUrls = urls =>
  // An overlay with the same id and orgUnit has the same data across projects
  Object.values(groupBy(urls, u => `${u.id}___${u.orgUnit}`))
    .map(urlGroup => urlGroup[0])
    .flat();

const stringifyUrl = url => {
  if (typeof url === 'string') {
    return url;
  }

  const { id, project, orgUnit, startDate, endDate, overlayPeriod } = url;
  const path = [project, orgUnit].map(encodeURIComponent).join('/');
  const queryParams = {
    overlay: toArray(id).join(','),
    overlayPeriod: overlayPeriod || buildVizPeriod(startDate, endDate),
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
  const [project, orgUnit] = path
    .split('/')
    .filter(x => x !== '')
    .map(decodeURIComponent);

  return {
    id: searchParams.get('overlay'),
    project,
    orgUnit,
    overlayPeriod: searchParams.get('overlayPeriod'),
  };
};

export const generateOverlayConfig = async db => {
  const { mapOverlays: overlayConfig } = config;

  const urls = await buildUrlsUsingConfig(overlayConfig);
  const objectUrls = removeRedundantObjectUrls(urls.map(parseUrl));

  return {
    allowEmptyResponse: overlayConfig.allowEmptyResponse,
    snapshotTypes: overlayConfig.snapshotTypes,
    urls: sortUrls(objectUrls.map(stringifyUrl)),
  };
};
