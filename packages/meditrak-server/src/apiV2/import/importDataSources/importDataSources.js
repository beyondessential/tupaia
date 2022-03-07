/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import path from 'path';
import xlsx from 'xlsx';
import { respond, DatabaseError, UploadError } from '@tupaia/utils';
import { assertAnyPermissions, assertBESAdminAccess } from '../../../permissions';
import { createDataSources } from './createDataSources';

const extractDataSourceFromSheets = filePath => {
  const extension = path.extname(filePath);
  if (extension !== '.xlsx') {
    throw new Error(`Unsupported file type: ${extension}`);
  }
  const { Sheets: sheets } = xlsx.readFile(filePath);
  return xlsx.utils.sheet_to_json(Object.values(sheets)[0]);
};

/**
 * Responds to POST requests to the /import/dataSources endpoint
 */
export async function importDataSources(req, res) {
  try {
    const { models } = req;

    let dataSources;

    try {
      dataSources = extractDataSourceFromSheets(req.file.path);
    } catch (error) {
      throw new UploadError(error);
    }

    await req.assertPermissions(assertAnyPermissions([assertBESAdminAccess]));

    await models.wrapInTransaction(async transactingModels => {
      await createDataSources(transactingModels, dataSources);
    });
    respond(res, { message: 'Imported data sources' });
  } catch (error) {
    if (error.respond) {
      throw error; // Already a custom error with a responder
    } else {
      throw new DatabaseError('importing data sources', error);
    }
  }
}
