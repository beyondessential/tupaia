import {
  respond,
  DatabaseError,
  UploadError,
  ValidationError,
  ImportValidationError,
} from '@tupaia/utils';
import { updateCountryEntities } from './updateCountryEntities';
import { extractEntitiesByCountryName } from './extractEntitiesByCountryName';
import * as ResolveSheetCountry from './resolveSheetCountry';
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

/**
 * Responds to POST requests to the /import/entities endpoint.
 *
 * Project context is now required (TUP-3061). The admin panel only renders the
 * Entities tab inside a single-project route, so the axios interceptor always
 * supplies `projectCode`. Missing it is a 400.
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

    let entitiesByCountryName;
    try {
      entitiesByCountryName = extractEntitiesByCountryName(req.file.path);
    } catch (error) {
      throw new UploadError(error);
    }

    // Resolve every sheet name (which may be either a country_code or a legacy
    // country_name) to a canonical country_code, and reject any sheet whose
    // country isn't in the active project's country list.
    const projectCountryCodes = await loadProjectCountryCodes(models, project.id);
    const sheetsByCountryCode = {};
    for (const [sheetName, entities] of Object.entries(entitiesByCountryName)) {
      const countryCode = await ResolveSheetCountry.resolveSheetCountry(models, sheetName);
      if (!projectCountryCodes.has(countryCode)) {
        throw new ImportValidationError(
          `Sheet "${sheetName}" maps to country ${countryCode}, which is not in project ${projectCode}.`,
        );
      }
      sheetsByCountryCode[countryCode] = { sheetName, entities };
    }

    const importEntitiesPermissionsChecker = async accessPolicy =>
      assertCanImportEntities(
        accessPolicy,
        Object.values(sheetsByCountryCode).map(s => s.sheetName),
      );

    await req.assertPermissions(
      assertAnyPermissions([assertBESAdminAccess, importEntitiesPermissionsChecker]),
    );

    await models.wrapInTransaction(async transactingModels => {
      for (const { sheetName, entities } of Object.values(sheetsByCountryCode)) {
        await updateCountryEntities(transactingModels, sheetName, entities, pushToDhis, project.id);
      }
    });
    respond(res, { message: 'Imported entities' });
  } catch (error) {
    if (error.respond) {
      throw error; // Already a custom error with a responder
    } else {
      throw new DatabaseError('importing entities', error);
    }
  }
}
