import { respond, DatabaseError, UploadError } from '@tupaia/utils';
import { populateCoordinatesForCountry } from './populateCoordinatesForCountry';
import { updateCountryEntities } from './updateCountryEntities';
import { extractEntitiesByCountryName } from './extractEntitiesByCountryName';
import { assertAnyPermissions, assertBESAdminAccess } from '../../../permissions';
import { assertCanImportEntities } from './assertCanImportEntities';

const importEntity = async (
  transactingModels,
  countryName,
  entities,
  pushToDhis,
  automaticallyFetchGeojson,
) => {
  // Create the entity, along with matching country, geographical_area, and clinic records

  const country = await updateCountryEntities(transactingModels, countryName, entities, pushToDhis);

  if (automaticallyFetchGeojson) {
    // Go through country and all district/subdistricts, and if any are missing coordinates,
    // attempt to fetch them and populate the database
    await populateCoordinatesForCountry(transactingModels, country.code);
  }
};
/**
 * Responds to POST requests to the /import/entities endpoint
 */
export async function importEntities(req, res) {
  try {
    const { models, query } = req;

    let entitiesByCountryName;
    const pushToDhis = query?.pushToDhis ? query?.pushToDhis === 'true' : true;
    const automaticallyFetchGeojson = query?.automaticallyFetchGeojson
      ? query?.automaticallyFetchGeojson === 'true'
      : true;

    try {
      entitiesByCountryName = extractEntitiesByCountryName(req.file.path);
    } catch (error) {
      throw new UploadError(error);
    }

    const importEntitiesPermissionsChecker = async accessPolicy =>
      assertCanImportEntities(accessPolicy, Object.keys(entitiesByCountryName));

    await req.assertPermissions(
      assertAnyPermissions([assertBESAdminAccess, importEntitiesPermissionsChecker]),
    );

    await models.wrapInTransaction(async transactingModels => {
      for (const countryEntries of Object.entries(entitiesByCountryName)) {
        const [countryName, entities] = countryEntries;

        await importEntity(
          transactingModels,
          countryName,
          entities,
          pushToDhis,
          automaticallyFetchGeojson,
        );
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
