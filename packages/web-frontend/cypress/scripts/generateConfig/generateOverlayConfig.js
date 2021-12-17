/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { groupBy } from 'lodash';

import { getUniqueEntries, mapKeys, stringifyQuery, toArray, yup, yupUtils } from '@tupaia/utils';
import config from '../../config.json';
import {
  buildUrlSchema,
  buildUrlsUsingConfig,
  buildVizPeriod,
  filterObjectUrls,
  sortUrls,
  VIZ_TYPES,
} from './helpers';

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

const generateUrls = async (db, options) => {
  if (Object.keys(options).length === 0) {
    return [];
  }

  const tableOverlayCountry = 'temp_overlay_country';
  const tableOverlayProject = 'temp_overlay_project';

  const generationToQueryField = {
    id: 'id',
    orgUnit: `${tableOverlayCountry}.orgUnit`,
    project: `${tableOverlayProject}.project`,
  };
  const where = mapKeys(options, generationToQueryField);

  await db.executeSql(`
    DROP TABLE IF EXISTS ${tableOverlayCountry};
    CREATE TEMP TABLE ${tableOverlayCountry} AS
    SELECT id AS overlay_id, unnest("country_codes") AS "orgUnit"
    FROM "map_overlay";

    DROP TABLE IF EXISTS ${tableOverlayProject};
    CREATE TEMP TABLE ${tableOverlayProject} AS
    SELECT id AS overlay_id, unnest("project_codes") AS project
    FROM "map_overlay";
  `);

  const queryOptions = {
    multiJoin: [
      {
        joinWith: tableOverlayCountry,
        joinCondition: [`${tableOverlayCountry}.overlay_id`, 'map_overlay.id'],
      },
      {
        joinWith: tableOverlayProject,
        joinCondition: [`${tableOverlayProject}.overlay_id`, 'map_overlay.id'],
      },
    ],
  };

  const overlays = await db.find('map_overlay', where, queryOptions);
  const linkedOverlays = await db.find('map_overlay', {
    id: getUniqueEntries(overlays.map(o => o.linked_measures).flat()),
  });
  const linkedOverlayIds = linkedOverlays.map(({ id }) => id);

  return overlays
    .filter(o => !linkedOverlayIds.includes(o.id))
    .map(overlay => {
      const { id, project, orgUnit, linked_measures: linkedMeasures } = overlay;

      return {
        id: linkedMeasures ? [id, ...linkedMeasures] : id,
        project,
        orgUnit,
      };
    });
};

export const generateOverlayConfig = async db => {
  const { mapOverlays: overlayConfig } = config;
  const { filter = {} } = overlayConfig;

  const urls = await buildUrlsUsingConfig(db, overlayConfig, generateUrls);
  const objectUrls = removeRedundantObjectUrls(urls.map(parseUrl));
  const filteredObjectUrls = filterObjectUrls(objectUrls, filter, VIZ_TYPES.MAP_OVERLAY);

  return {
    allowEmptyResponse: overlayConfig.allowEmptyResponse,
    snapshotTypes: overlayConfig.snapshotTypes,
    urls: sortUrls(filteredObjectUrls.map(stringifyUrl)),
  };
};
