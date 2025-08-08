import path from 'path';
import xlsx from 'xlsx';
import { respond, UploadError } from '@tupaia/utils';
import {
  assertAdminPanelAccess,
  assertAnyPermissions,
  assertBESAdminAccess,
} from '../../../permissions';
import { createDataElements } from './createDataElements';

const extractDataElementFromSheets = filePath => {
  const extension = path.extname(filePath);
  if (extension !== '.xlsx') {
    throw new Error(`Unsupported file type: ${extension}`);
  }
  const { Sheets: sheets } = xlsx.readFile(filePath);
  return xlsx.utils.sheet_to_json(Object.values(sheets)[0]);
};

/**
 * Responds to POST requests to the /import/dataElements endpoint
 */
export async function importDataElements(req, res) {
  const { models } = req;

  let dataElements;

  try {
    dataElements = extractDataElementFromSheets(req.file.path);
  } catch (error) {
    throw new UploadError(error);
  }

  await req.assertPermissions(assertAnyPermissions([assertBESAdminAccess, assertAdminPanelAccess]));

  await models.wrapInTransaction(async transactingModels => {
    await createDataElements(transactingModels, dataElements);
  });
  respond(res, { message: 'Imported data elements' });
}
