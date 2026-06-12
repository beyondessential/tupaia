import path from 'node:path';
import xlsx from 'xlsx';

/**
 * Parse an attribute cell (`attributes`, `data_service_entity`) written as
 * newline-separated `key: value` lines — the human-friendly reference-data
 * format the exporter emits (see exportEntities.js). These columns are flat
 * scalar objects; `true`/`false` round-trip back to booleans, everything else
 * stays a string (so ids like a kobo_id aren't coerced to numbers).
 */
const parseKeyValueCell = (value, field) => {
  if (value === null || value === undefined || value === '') return undefined;
  if (typeof value === 'object') return value; // already an object (defensive)

  const result = {};
  for (const line of String(value).split('\n')) {
    const trimmed = line.trim();
    if (trimmed === '') continue;
    const separatorIndex = trimmed.indexOf(':');
    if (separatorIndex === -1) {
      throw new Error(`The "${field}" column must be "key: value" lines, got: ${line}`);
    }
    const key = trimmed.slice(0, separatorIndex).trim();
    const rawValue = trimmed.slice(separatorIndex + 1).trim();
    if (rawValue === 'true') result[key] = true;
    else if (rawValue === 'false') result[key] = false;
    else result[key] = rawValue;
  }
  return Object.keys(result).length > 0 ? result : undefined;
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
    entity.attributes = parseKeyValueCell(row.attributes, 'attributes');
  }
  if (row.data_service_entity) {
    entity.data_service_entity = parseKeyValueCell(row.data_service_entity, 'data_service_entity');
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
