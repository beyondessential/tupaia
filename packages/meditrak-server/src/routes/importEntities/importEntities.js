/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 **/

import xlsx from 'xlsx';
import { respond } from '@tupaia/utils';
import { DatabaseError, UploadError } from '../../errors';
import { updateOrganisationUnitsFromSheet } from './updateOrganisationUnitsFromSheet';
import { populateCoordinatesForCountry } from './populateCoordinatesForCountry';

/**
 * Responds to POST requests to the /import/entities endpoint
 */
export async function importEntities(req, res) {
  try {
    const { models } = req;
    if (!req.file) {
      throw new UploadError();
    }
    const workbook = xlsx.readFile(req.file.path);
    await models.wrapInTransaction(async transactingModels => {
      for (const countryFacilities of Object.entries(workbook.Sheets)) {
        const [countryName, sheet] = countryFacilities;

        // Create the entities, along with matching country, geographical_area, and clinic records
        const country = await updateOrganisationUnitsFromSheet(
          transactingModels,
          countryName,
          sheet,
        );

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
