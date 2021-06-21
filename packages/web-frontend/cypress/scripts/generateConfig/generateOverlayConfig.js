import { uniq } from 'lodash';

import { compareAsc, stringifyQuery } from '@tupaia/utils';
import config from '../../config.json';
import { readJsonFile } from './helpers';

const URL_GENERATION_FIELDS = {
  PROJECT: 'project',
};

const buildUrl = urlInput => {
  if (typeof urlInput === 'string') {
    return urlInput;
  }

  const { id, project, orgUnit } = urlInput;
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

const generateUrlsUsingOptions = async (db, options) => {
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

  const { urlFiles = [], urlGenerationOptions = {}, urls = [], ...otherConfig } = overlayConfig;
  const urlsFromFiles = urlFiles.map(readJsonFile).flat();
  const generatedUrls = await generateUrlsUsingOptions(db, urlGenerationOptions);
  const allUrls = [...urlsFromFiles, ...generatedUrls, ...urls];

  return {
    ...otherConfig,
    urls: uniq(allUrls.map(buildUrl)).sort(compareAsc),
  };
};
