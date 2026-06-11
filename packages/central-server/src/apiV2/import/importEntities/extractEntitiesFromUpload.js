import path from 'node:path';
import xlsx from 'xlsx';

/**
 * Parse a JSON-object cell (`attributes`, `data_service_entity`). The exporter
 * writes these with `JSON.stringify`, so the importer must `JSON.parse` them to
 * round-trip cleanly. (The legacy `key:value`-per-line `convertCellToJson`
 * parser mangled the JSON — e.g. `{"x":"y"}` became `{'{"x"':'"y"}'}`.)
 */
const parseJsonObjectCell = (value, field) => {
  if (value === null || value === undefined || value === '') return undefined;
  if (typeof value === 'object') return value; // already an object (defensive)
  let parsed;
  try {
    parsed = JSON.parse(value);
  } catch (error) {
    throw new Error(`Invalid JSON in the "${field}" column: ${value}`);
  }
  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error(`The "${field}" column must be a JSON object, got: ${value}`);
  }
  return parsed;
};

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
  if (row.attributes) {
    entity.attributes = parseJsonObjectCell(row.attributes, 'attributes');
  }
  if (row.data_service_entity) {
    entity.data_service_entity = parseJsonObjectCell(row.data_service_entity, 'data_service_entity');
  }
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
