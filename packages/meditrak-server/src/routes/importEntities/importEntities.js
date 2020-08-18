/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { respond, DatabaseError, UploadError } from '@tupaia/utils';
import { populateCoordinatesForCountry } from './populateCoordinatesForCountry';
import { updateCountryEntities } from './updateCountryEntities';
import { extractEntitiesByCountryName } from './extractEntitiesByCountryName';
import {
  checkAnyPermissions,
  hasBESAdminAccess,
  hasEntitiesImportPermissions,
} from '../../permissions';

/**
 * Responds to POST requests to the /import/entities endpoint
 */
export async function importEntities(req, res) {
  try {
    const { models } = req;
    let entitiesByCountryName;
    try {
      entitiesByCountryName = extractEntitiesByCountryName(req.file.path);
    } catch (error) {
      throw new UploadError(error);
    }

    await models.wrapInTransaction(async transactingModels => {
      const importEntitiesPermissionsChecker = async accessPolicy => {
        await hasEntitiesImportPermissions(accessPolicy, transactingModels, entitiesByCountryName);
      };

      //Need at least TupaiaAdminPanelUserAccess or BESAdminAccess to proceed
      await req.checkPermissions(
        checkAnyPermissions(
          [hasBESAdminAccess, importEntitiesPermissionsChecker],
          'You need either BES Admin or Tupaia Admin Panel access to the countries of the entities to import them',
        ),
      );

      for (const countryEntries of Object.entries(entitiesByCountryName)) {
        const [countryName, entities] = countryEntries;

        // Create the entities, along with matching country, geographical_area, and clinic records
        const country = await updateCountryEntities(transactingModels, countryName, entities);

        // Go through country and all district/subdistricts, and if any are missing coordinates,
        // attempt to fetch them and populate the database
        await populateCoordinatesForCountry(transactingModels, country.code);
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
