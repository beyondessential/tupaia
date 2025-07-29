import fs from 'fs';
import { groupBy } from 'es-toolkit/compat';
import path from 'path';
import xlsx from 'xlsx';

import { convertCellToJson } from '../importSurveys/utilities';

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

  return groupBy(entities, 'country_name');
};

const processXlsxRow = (row, { countryName }) => {
  const entity = { ...row, country_name: countryName };
  const { geojson, attributes, data_service_entity: dataServiceEntity } = row;
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
  const workbook = xlsx.readFile(filePath, { raw: false });
  return Object.entries(workbook.Sheets).reduce(
    (entitiesByCountry, [countryName, sheet]) => ({
      ...entitiesByCountry,
      [countryName]: xlsx.utils
        .sheet_to_json(sheet, { defval: null, raw: false })
        .filter(row => Object.values(row).some(value => value !== null))
        .map(row => processXlsxRow(row, { countryName })),
    }),
    {},
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
export const extractEntitiesByCountryName = filePath => {
  const extension = path.extname(filePath);
  const parseFile = EXTENSION_TO_FILE_PARSER[extension];
  if (!parseFile) {
    throw new Error(`Unsupported file type: ${extension}`);
  }

  return parseFile(filePath);
};
