/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { groupBy } from 'lodash';

import {
  constructIsOneOfType,
  getUniqueEntries,
  hasContent,
  isAString,
  mapKeys,
  ObjectValidator,
  stringifyQuery,
  toArray,
} from '@tupaia/utils';
import config from '../../config.json';
import { buildUrlsUsingConfig, sortUrls, validateFilter } from './helpers';
import { MapOverlayFilter } from './VisualisationFilter';

const objectUrlSchema = {
  id: [hasContent, constructIsOneOfType(['string', 'array'])], // Array is for linked measures
  project: [hasContent, isAString],
  orgUnit: [hasContent, isAString],
};
const objectUrlValidator = new ObjectValidator(objectUrlSchema);

const URL_GENERATION_FIELDS = {
  ID: 'id',
  PROJECT: 'project',
  COUNTRY: 'country',
};

const FILTER_FIELDS = [...Object.keys(objectUrlSchema), 'measureBuilder'];

const removeRedundantObjectUrls = urls =>
  // An overlay with the same id and orgUnit is the same across projects
  Object.values(groupBy(urls, u => `${u.id}___${u.orgUnit}`))
    .map(urlGroup => urlGroup[0])
    .flat();

const stringifyUrl = url => {
  if (typeof url === 'string') {
    return url;
  }

  const { id, project, orgUnit } = url;
  const path = [project, orgUnit].map(encodeURIComponent).join('/');
  const queryParams = { overlay: toArray(id).join(',') };

  return stringifyQuery('', path, queryParams);
};

const validateUrlGenerationOptions = options => {
  Object.keys(options).forEach(key => {
    if (!Object.values(URL_GENERATION_FIELDS).includes(key)) {
      throw new Error(`Key ${key} is not supported in "urlGenerationOptions"`);
    }
  });
};

const parseUrl = url => {
  if (typeof url === 'object') {
    return url;
  }

  const [path, queryParams] = url.split('?');
  const searchParams = new URLSearchParams(queryParams);
  const [project, orgUnit] = path.split('/').filter(x => x !== '');

  const objectUrl = {
    id: searchParams.get('overlay'),
    project,
    orgUnit,
  };

  const constructError = (errorMessage, key) =>
    new Error(`Invalid content for component "${key}" of url "${url}": ${errorMessage}`);
  objectUrlValidator.validateSync(objectUrl, constructError);

  return objectUrl;
};

const generateUrls = async (db, options) => {
  if (Object.keys(options).length === 0) {
    return [];
  }
  validateUrlGenerationOptions(options);

  const tableOverlayCountry = 'temp_overlay_country';
  const tableOverlayProject = 'temp_overlay_project';

  const generationToQueryField = {
    [URL_GENERATION_FIELDS.ID]: 'id',
    [URL_GENERATION_FIELDS.COUNTRY]: `${tableOverlayCountry}.orgUnit`,
    [URL_GENERATION_FIELDS.PROJECT]: `${tableOverlayProject}.project`,
  };
  const where = mapKeys(options, generationToQueryField);

  await db.executeSql(`
    DROP TABLE IF EXISTS ${tableOverlayCountry};
    CREATE TEMP TABLE ${tableOverlayCountry} AS
    SELECT id AS overlay_id, unnest("countryCodes") AS "orgUnit"
    FROM "mapOverlay";

    DROP TABLE IF EXISTS ${tableOverlayProject};
    CREATE TEMP TABLE ${tableOverlayProject} AS
    SELECT id AS overlay_id, unnest("projectCodes") AS project
    FROM "mapOverlay";
  `);

  const queryOptions = {
    multiJoin: [
      {
        joinWith: tableOverlayCountry,
        joinCondition: [`${tableOverlayCountry}.overlay_id`, 'mapOverlay.id'],
      },
      {
        joinWith: tableOverlayProject,
        joinCondition: [`${tableOverlayProject}.overlay_id`, 'mapOverlay.id'],
      },
    ],
  };

  const overlays = await db.find('mapOverlay', where, queryOptions);
  const linkedOverlays = await db.find('mapOverlay', {
    id: getUniqueEntries(overlays.map(o => o.linkedMeasures).flat()),
  });
  const linkedOverlayIds = linkedOverlays.map(({ id }) => id);

  return overlays
    .filter(o => !linkedOverlayIds.includes(o.id))
    .map(overlay => {
      const { id, linkedMeasures } = overlay;
      return {
        ...overlay,
        id: linkedMeasures ? [id, ...linkedMeasures] : id,
      };
    });
};

export const generateOverlayConfig = async db => {
  const { mapOverlays: overlayConfig } = config;
  const { filter = {}, urlFiles, urlGenerationOptions, ...otherFields } = overlayConfig;
  validateFilter(filter, FILTER_FIELDS);

  const urls = await buildUrlsUsingConfig(db, overlayConfig, generateUrls);
  const objectUrls = removeRedundantObjectUrls(urls.map(parseUrl));
  const filteredObjectUrls = await new MapOverlayFilter(db, filter).apply(objectUrls);

  return {
    ...otherFields,
    urls: sortUrls(filteredObjectUrls.map(stringifyUrl)),
  };
};
