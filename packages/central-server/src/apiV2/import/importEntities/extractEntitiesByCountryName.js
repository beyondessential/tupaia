/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import fs from 'fs';
import { groupBy } from 'lodash';
import path from 'path';
import xlsx from 'xlsx';

import { convertCellToJson } from '../importSurveys/utilities';

export const VALID_ENTITY_TYPES_WITH_NO_COUNTRY = ['project'];
export const NO_COUNTRY = 'No Country';

const validateNoCountryEntities = entities =>
  entities.forEach(entity => {
    if (!VALID_ENTITY_TYPES_WITH_NO_COUNTRY.includes(entity.entity_type)) {
      throw new Error(`Country must be specified for entity type: ${entity.entity_type}`);
    }
  });

const geojsonParser = filePath => {
  const fileContents = fs.readFileSync(filePath, { encoding: 'utf-8' });
  const { features } = JSON.parse(fileContents);

  const entities = features.map(feature => {
    const { properties: entity, geometry, geojson } = feature;
    if (!entity) {
      throw new Error('Each feature must have a "properties" field');
    }
    if (!entity.country_name) {
      throw new Error(`Missing property "country_name" for feature with name ${entity.name}`);
    }

    if (geometry || geojson) {
      entity.geojson = geometry || geojson;
    }

    return entity;
  });

  const { [NO_COUNTRY]: entitiesWithoutCountry = [], ...entitiesByCountry } = groupBy(
    entities,
    'country_name',
  );
  return { entitiesByCountry, entitiesWithoutCountry };
};

const processXlsxRow = (row, countryName) => {
  const entity = { ...row };
  const { geojson, attributes, data_service_entity: dataServiceEntity } = row;
  if (countryName) {
    entity.country_name = countryName;
  }
  if (geojson) {
    entity.geojson = JSON.parse(geojson);
  }
  if (attributes) {
    entity.attributes = convertCellToJson(attributes);
  }
  if (dataServiceEntity) {
    entity.data_service_entity = convertCellToJson(dataServiceEntity);
  }

  return entity;
};

const xlsxParser = filePath => {
  const workbook = xlsx.readFile(filePath);
  return Object.entries(workbook.Sheets).reduce(
    ({ entitiesByCountry, entitiesWithoutCountry }, [countryName, sheet]) => {
      const parsedSheet = xlsx.utils.sheet_to_json(sheet);
      if (countryName === NO_COUNTRY) {
        return {
          entitiesByCountry,
          entitiesWithoutCountry: [
            ...entitiesWithoutCountry,
            ...parsedSheet.map(row => processXlsxRow(row)),
          ],
        };
      }

      return {
        entitiesWithoutCountry,
        entitiesByCountry: {
          ...entitiesByCountry,
          [countryName]: parsedSheet.map(row => processXlsxRow(row, countryName)),
        },
      };
    },
    { entitiesByCountry: {}, entitiesWithoutCountry: [] },
  );
};

const EXTENSION_TO_FILE_PARSER = {
  '.geojson': geojsonParser,
  '.xlsx': xlsxParser,
};

/**
 * @param {string} filePath
 * @returns {[ string, Array ]} Entities grouped by country name
 */
export const extractEntitiesByCountry = filePath => {
  const extension = path.extname(filePath);
  const parseFile = EXTENSION_TO_FILE_PARSER[extension];
  if (!parseFile) {
    throw new Error(`Unsupported file type: ${extension}`);
  }

  const { entitiesByCountry, entitiesWithoutCountry } = parseFile(filePath);
  validateNoCountryEntities(entitiesWithoutCountry);
  return { entitiesByCountry, entitiesWithoutCountry };
};
