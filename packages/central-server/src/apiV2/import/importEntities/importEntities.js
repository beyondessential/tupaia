/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { respond, DatabaseError, UploadError } from '@tupaia/utils';
import { populateCoordinatesForCountry } from './populateCoordinatesForCountry';
import { updateCountry, updateEntities } from './updateEntities';
import { extractEntitiesByCountry } from './extractEntitiesByCountryName';
import { assertAnyPermissions, assertBESAdminAccess } from '../../../permissions';
import { assertCanImportEntities } from './assertCanImportEntities';

/**
 * Responds to POST requests to the /import/entities endpoint
 */
export async function importEntities(req, res) {
  try {
    const { models, query } = req;

    let entitiesByCountry;
    let entitiesWithoutCountry;
    const pushToDhis = query?.pushToDhis ? query?.pushToDhis === 'true' : true;
    const automaticallyFetchGeojson = query?.automaticallyFetchGeojson
      ? query?.automaticallyFetchGeojson === 'true'
      : true;

    try {
      ({ entitiesByCountry, entitiesWithoutCountry } = extractEntitiesByCountry(req.file.path));
    } catch (error) {
      throw new UploadError(error);
    }

    const importEntitiesPermissionsChecker = async accessPolicy =>
      assertCanImportEntities(accessPolicy, Object.keys(entitiesByCountry));

    await req.assertPermissions(
      assertAnyPermissions([assertBESAdminAccess, importEntitiesPermissionsChecker]),
    );

    await models.wrapInTransaction(async transactingModels => {
      // First import all entities without countries (ie. project entities)
      await updateEntities(transactingModels, entitiesWithoutCountry, null, pushToDhis);

      for (const countryEntries of Object.entries(entitiesByCountry)) {
        const [countryName, entities] = countryEntries;

        // Create the matching country, geographical_area, and clinic records
        const country = await updateCountry(transactingModels, countryName, pushToDhis);
        // Create entities in the country
        await updateEntities(transactingModels, entities, pushToDhis, country);

        if (automaticallyFetchGeojson) {
          // Go through country and all district/subdistricts, and if any are missing coordinates,
          // attempt to fetch them and populate the database
          await populateCoordinatesForCountry(transactingModels, country.code);
        }
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
