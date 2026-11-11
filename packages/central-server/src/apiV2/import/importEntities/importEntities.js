import { groupBy } from 'es-toolkit/compat';
import {
  respond,
  DatabaseError,
  UploadError,
  ValidationError,
  ImportValidationError,
} from '@tupaia/utils';
import { updateCountryEntities } from './updateCountryEntities';
import { extractEntitiesFromUpload, findUnknownColumns } from './extractEntitiesFromUpload';
import { assertAnyPermissions, assertBESAdminAccess } from '../../../permissions';
import { assertCanImportEntities } from './assertCanImportEntities';

// Exported so tests that exercise unrelated code paths (permissions, etc.) can
// stub the project-country validation step.
export const loadProjectCountryCodes = async (models, projectId) => {
  const rows = await models.database.executeSql(
    `
      SELECT e.code
      FROM project_country pc
      JOIN entity e ON e.id = pc.country_id
      WHERE pc.project_id = ?;
    `,
    [projectId],
  );
  return new Set(rows.map(r => r.code));
};

// Snapshot the project's existing entities (keyed by code) so the importer can
// skip rows that wouldn't change anything (see isEntityUnchanged). This makes
// re-importing a whole exported sheet with only a few edits fast — the unchanged
// rows cost no per-row queries. Read once, before the write transaction.
export const loadExistingEntities = async (models, projectId, countryCodes) => {
  if (countryCodes.length === 0) return new Map();
  const rows = await models.database.executeSql(
    `
      SELECT e.code, e.name, e.type, e.country_code, e.image_url, e.attributes,
             e.entity_polygon_id,
             ST_X(e.point::geometry) AS longitude,
             ST_Y(e.point::geometry) AS latitude,
             parent.code AS parent_code,
             dse.config AS data_service_config
      FROM entity e
      LEFT JOIN entity parent ON parent.id = e.parent_id
      LEFT JOIN data_service_entity dse ON dse.entity_code = e.code
      WHERE e.project_id = ?
        -- Only the countries actually being imported, so a small single-country
        -- import doesn't load the whole (potentially huge) project into memory.
        AND e.country_code = ANY(?);
    `,
    [projectId, countryCodes],
  );
  return new Map(rows.map(row => [row.code, row]));
};

/**
 * Responds to POST requests to the /import/entities endpoint.
 *
 * Project context is required (TUP-3061). The admin panel only renders the
 * Entities tab inside a single-project route, so the axios interceptor always
 * supplies `projectCode`. Missing it is a 400.
 *
 * File format (TUP-3061 / TUP-3062): single xlsx sheet, one row per entity,
 * each row carries its own `country_code`. Per-country sheets and inline
 * `geojson` are no longer accepted — upload polygons via the GIS Data page
 * and reference them by id or natural key.
 */
export async function importEntities(req, res) {
  try {
    const { models, query } = req;
    const pushToDhis = query?.pushToDhis ? query?.pushToDhis === 'true' : true;

    const projectCode = query?.projectCode;
    if (!projectCode) {
      throw new ValidationError(
        'projectCode query parameter is required. Switch to a project before importing.',
      );
    }
    const project = await models.project.findOne({ code: projectCode });
    if (!project) {
      throw new ValidationError(`Unknown projectCode: ${projectCode}`);
    }

    let rows;
    try {
      rows = extractEntitiesFromUpload(req.file.path);
    } catch (error) {
      throw new UploadError(error);
    }

    if (rows.length === 0) {
      throw new ImportValidationError('Upload contains no entity rows.');
    }

    // Unrecognised header columns are ignored (not all importers write every
    // column), but warn so a typo like "attribeauts" doesn't silently drop data.
    const unknownColumns = findUnknownColumns(rows);
    const warnings = unknownColumns.length
      ? [
          `Ignored unrecognised column${
            unknownColumns.length > 1 ? 's' : ''
          }: ${unknownColumns.join(', ')}. Check the header row for typos — data in ${
            unknownColumns.length > 1 ? 'these columns was' : 'this column was'
          } not imported.`,
        ]
      : [];

    // Country rows are skipped on import (see updateCountryEntities): countries
    // are shared entities, not project-scoped, and are managed via the Countries
    // admin page. Warn so a user editing a country's name/attributes/GIS isn't
    // misled by a silent no-op.
    const skippedCountryCount = rows.filter(
      row => row.entity_type === models.entity.types.COUNTRY,
    ).length;
    if (skippedCountryCount > 0) {
      warnings.push(
        `Skipped ${skippedCountryCount} country row${
          skippedCountryCount > 1 ? 's' : ''
        }. Country entities are shared and can't be created or edited via project import — manage them on the Countries admin page.`,
      );
    }

    // Validate every row carries a country_code (load-bearing now that sheet
    // names no longer define the country) and that the country is in this
    // project. Row-level errors point at the spreadsheet row number.
    const projectCountryCodes = await loadProjectCountryCodes(models, project.id);
    rows.forEach((row, index) => {
      const excelRowNumber = index + 2;
      if (!row.country_code) {
        throw new ImportValidationError(
          'Missing country_code',
          excelRowNumber,
          'country_code',
        );
      }
      if (!projectCountryCodes.has(row.country_code)) {
        throw new ImportValidationError(
          `country_code "${row.country_code}" is not in project ${projectCode}.`,
          excelRowNumber,
          'country_code',
        );
      }
    });

    const rowsByCountryCode = groupBy(rows, 'country_code');

    const importEntitiesPermissionsChecker = async accessPolicy =>
      assertCanImportEntities(accessPolicy, Object.keys(rowsByCountryCode));

    await req.assertPermissions(
      assertAnyPermissions([assertBESAdminAccess, importEntitiesPermissionsChecker]),
    );

    const existingEntitiesByCode = await loadExistingEntities(
      models,
      project.id,
      Object.keys(rowsByCountryCode),
    );

    await models.wrapInTransaction(async transactingModels => {
      for (const [countryCode, countryRows] of Object.entries(rowsByCountryCode)) {
        await updateCountryEntities(
          transactingModels,
          countryCode,
          countryRows,
          pushToDhis,
          project.id,
          existingEntitiesByCode,
        );
      }
    });
    respond(res, { message: 'Imported entities', warnings });
  } catch (error) {
    if (error.respond) {
      throw error; // Already a custom error with a responder
    } else {
      throw new DatabaseError('importing entities', error);
    }
  }
}
