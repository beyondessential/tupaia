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
// Columns the importer reads, plus legacy columns it deliberately ignores
// (facility_type/type_name/category_code — facility classification is no longer
// imported). Anything outside this set is almost always a header typo, so we
// surface it as a non-fatal warning rather than silently dropping it.
const KNOWN_COLUMNS = new Set([
  'code',
  'name',
  'entity_type',
  'country_code',
  'parent_code',
  'latitude',
  'longitude',
  'screen_bounds',
  'image_url',
  'attributes',
  'data_service_entity',
  'entity_polygon_id',
  'entity_polygon_code',
  'entity_polygon_data_source',
  'district',
  'sub_district',
  'district_osm_id',
  'sub_district_osm_id',
  // Legacy facility columns, accepted but ignored
  'facility_type',
  'type_name',
  'category_code',
]);

// Unrecognised header columns across the upload, sorted and de-duplicated. A
// blank cell still carries its header key (sheet_to_json uses defval), so a
// column with a misspelt header is caught even when its values are empty.
export const findUnknownColumns = rows => {
  const seen = new Set();
  for (const row of rows) {
    for (const column of Object.keys(row)) {
      if (!KNOWN_COLUMNS.has(column)) seen.add(column);
    }
  }
  return [...seen].sort();
};

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
