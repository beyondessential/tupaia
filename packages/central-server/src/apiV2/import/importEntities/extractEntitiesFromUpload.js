import path from 'node:path';
import xlsx from 'xlsx';
import { convertCellToJson } from '../importSurveys/utilities';

/**
 * Extract entity rows from a single-sheet xlsx upload. The file format
 * (post-TUP-3061) is one sheet per project, each row carrying its own
 * `country_code`. The sheet name itself is informational.
 *
 * Inline `geojson` is no longer accepted — polygons must be uploaded via the
 * GIS Data page first and referenced by `entity_polygon_id` (rename-stable,
 * emitted by the new exporter) or by the natural-key pair
 * `entity_polygon_code` + `entity_polygon_data_source` (human-readable, what
 * you wrote when authoring the polygon GeoJSON).
 */
const processXlsxRow = row => {
  const entity = { ...row };
  // attributes / data_service_entity are newline-separated `key: value` cells.
  // Parse them with the same helper the rest of the importer uses, so the format
  // stays identical to the reference-data import: all values are strings. A blank
  // cell means "no attributes" — normalise to undefined so the importer skips the
  // update rather than writing an empty string to the jsonb column.
  entity.attributes = row.attributes ? convertCellToJson(row.attributes) : undefined;
  entity.data_service_entity = row.data_service_entity
    ? convertCellToJson(row.data_service_entity)
    : undefined;
  return entity;
};

export const extractEntitiesFromUpload = filePath => {
  const extension = path.extname(filePath);
  if (extension !== '.xlsx') {
    throw new Error(`Unsupported file type: ${extension}. Upload an .xlsx file.`);
  }

  const workbook = xlsx.readFile(filePath, { raw: false });
  const sheetNames = workbook.SheetNames;
  if (sheetNames.length === 0) {
    throw new Error('Upload contains no sheets.');
  }
  // Single-sheet format: read the first sheet, ignore extras (covers the
  // common case of a stray "Sheet2" Excel sometimes appends).
  const [primarySheetName] = sheetNames;
  const sheet = workbook.Sheets[primarySheetName];

  const rows = xlsx.utils
    .sheet_to_json(sheet, { defval: null, raw: false })
    .filter(row => Object.values(row).some(value => value !== null));

  return rows.map(processXlsxRow);
};
