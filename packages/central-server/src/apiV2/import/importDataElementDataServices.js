import xlsx from 'xlsx';
import {
  respond,
  ImportValidationError,
  UploadError,
  ObjectValidator,
  hasContent,
  constructIsOneOf,
  constructRecordExistsWithCode,
} from '@tupaia/utils';
import { assertBESAdminAccess } from '../../permissions';
import { DATA_SOURCE_SERVICE_TYPES } from '../../database/models/DataElement';

const extractItems = filePath => {
  const { Sheets: sheets } = xlsx.readFile(filePath);
  return xlsx.utils.sheet_to_json(Object.values(sheets)[0]);
};

async function create(transactingModels, items) {
  const validator = new ObjectValidator({
    data_element_code: [constructRecordExistsWithCode(transactingModels.dataElement)],
    country_code: [hasContent],
    service_type: [constructIsOneOf(DATA_SOURCE_SERVICE_TYPES)],
    service_config: [hasContent],
  });

  let excelRowNumber = 0;

  const constructImportValidationError = (message, field) =>
    new ImportValidationError(message, excelRowNumber, field);

  for (const item of items) {
    excelRowNumber++;
    await validator.validate(item, constructImportValidationError);

    const { data_element_code, country_code } = item;

    const existingRecord = await transactingModels.dataElementDataService.findOne({
      data_element_code,
      country_code,
    });
    if (existingRecord) {
      await transactingModels.dataElementDataService.update(
        { data_element_code, country_code },
        item,
      );
    } else {
      await transactingModels.dataElementDataService.create(item);
    }
  }
}

/**
 * Responds to POST requests to the /import/dataElementDataServices endpoint
 */
export async function importDataElementDataServices(req, res) {
  const { models } = req;

  await req.assertPermissions(assertBESAdminAccess);

  let items;
  try {
    items = extractItems(req.file.path);
  } catch (error) {
    throw new UploadError(error);
  }

  await models.wrapInTransaction(async transactingModels => {
    await create(transactingModels, items);
  });
  respond(res, { message: 'Imported mapping' });
}
