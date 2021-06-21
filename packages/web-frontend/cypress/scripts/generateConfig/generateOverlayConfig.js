/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { groupBy } from 'lodash';

import {
  constructIsOneOfType,
  hasContent,
  isAString,
  ObjectValidator,
  stringifyQuery,
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
  PROJECT: 'project',
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
  const queryParams = { overlay: id };

  return stringifyQuery('', path, queryParams);
};

const validateUrlGenerationOptions = options => {
  Object.keys(options).forEach(key => {
    if (!Object.values(URL_GENERATION_FIELDS).includes(key)) {
      throw new Error(`Key ${key} is not supported in "urlGenerationOptions"`);
    }
  });
};

const objectifyUrl = url => {
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

  const tableOverlayCountry = 'temp_overlay_country';
  const tableOverlayProject = 'temp_overlay_project';

  validateUrlGenerationOptions(options);
  const where = {};
  if (URL_GENERATION_FIELDS.PROJECT in options) {
    where[`${tableOverlayProject}.project`] = options.project;
  }

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

  return db.find('mapOverlay', where, queryOptions);
};

export const generateOverlayConfig = async db => {
  const { mapOverlays: overlayConfig } = config;
  const { filter = {}, urlFiles, urlGenerationOptions, ...otherFields } = overlayConfig;
  validateFilter(filter, FILTER_FIELDS);

  const urls = await buildUrlsUsingConfig(db, overlayConfig, generateUrls);
  const objectUrls = removeRedundantObjectUrls(urls.map(objectifyUrl));
  const filteredObjectUrls = await new MapOverlayFilter(db, filter).apply(objectUrls);

  return {
    ...otherFields,
    urls: sortUrls(filteredObjectUrls.map(stringifyUrl)),
  };
};
