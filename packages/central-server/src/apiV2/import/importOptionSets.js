import xlsx from 'xlsx';
import {
  respond,
  DatabaseError,
  UploadError,
  ImportValidationError,
  ValidationError,
  TypeValidationError,
} from '@tupaia/utils';
import { extractTabNameFromQuery, getArrayQueryParameter } from '../utilities';
import { convertCellToJson } from './importSurveys/utilities';
import {
  assertAnyPermissions,
  assertBESAdminAccess,
  assertAdminPanelAccess,
} from '../../permissions';
import { assertOptionSetEditPermissions } from '../optionSets/assertOptionSetPermissions';

/**
 * Responds to POST requests to the /import/optionSets endpoint
 */
export async function importOptionSets(req, res) {
  const { models } = req;
  if (!req.query || !req.query.optionSetNames) {
    throw new ValidationError('HTTP query should contain optionSetNames');
  }
  const optionSetNames = getArrayQueryParameter(req.query.optionSetNames);
  if (!req.file) {
    throw new UploadError();
  }
  try {
    const workbook = xlsx.readFile(req.file.path);
    await models.wrapInTransaction(async transactingModels => {
      for (const optionSetSheet of Object.entries(workbook.Sheets)) {
        const [tabName, sheet] = optionSetSheet;
        const optionSetName = extractTabNameFromQuery(tabName, optionSetNames);

        // If optionSet already exists, check we have permission to edit
        // Otherwise just check we have Tupaia Admin Panel access
        let optionSet = await transactingModels.optionSet.findOne({
          name: optionSetName,
        });
        if (optionSet) {
          const optionSetChecker = accessPolicy =>
            assertOptionSetEditPermissions(accessPolicy, transactingModels, optionSet.id);
          await req.assertPermissions(
            assertAnyPermissions([assertBESAdminAccess, optionSetChecker]),
          );
        } else {
          await req.assertPermissions(
            assertAnyPermissions([assertBESAdminAccess, assertAdminPanelAccess]),
          );
          optionSet = await transactingModels.optionSet.create({ name: optionSetName });
        }

        if (!optionSet) {
          throw new DatabaseError('creating option set, check format of import file');
        }

        const options = xlsx.utils.sheet_to_json(sheet);
        if (!options || options.length === 0) {
          throw new ImportValidationError('No options listed in import file');
        }

        const optionValues = new Set();
        const optionNames = new Set();
        const optionSortOrders = new Set();
        for (let rowIndex = 0; rowIndex < options.length; rowIndex++) {
          const option = options[rowIndex];
          // optionName is what the frontend shows, and MUST be unique, or bad things will happen.
          const optionName = option.label || option.value;
          const excelRowNumber = rowIndex + 2; // +2 to make up for header and 0 index
          // if no custom sort_order is supplied, use the excelRowNumber to sort the options
          const sortOrder = option.sort_order || excelRowNumber.toString();
          const attributes = option.attributes ? convertCellToJson(option.attributes) : {};

          // validate that there are no duplicate values or names within this option set sheet.
          if (optionValues.has(option.value) || optionNames.has(optionName)) {
            throw new ImportValidationError('Option value or label is not unique', excelRowNumber);
          }
          // validate the sort_order is unique
          if (optionSortOrders.has(sortOrder)) {
            throw new ImportValidationError('Sort order is not unique', excelRowNumber);
          }
          optionValues.add(option.value);
          optionNames.add(optionName);
          optionSortOrders.add(sortOrder);
          const optionObject = {
            value: option.value,
            label: option.label,
            sort_order: sortOrder,
            attributes,
            option_set_id: optionSet.id,
          };

          try {
            await transactingModels.option.updateOrCreate(
              {
                option_set_id: optionObject.option_set_id,
                value: optionObject.value,
              },
              optionObject,
            );
          } catch (error) {
            if (error instanceof TypeValidationError) {
              throw new ImportValidationError(error.message, excelRowNumber);
            }
          }
        }
        // Delete orphaned options.
        const existingOptions = await transactingModels.option.find({
          option_set_id: optionSet.id,
        });
        for (const option of existingOptions) {
          if (!optionValues.has(option.value)) {
            await transactingModels.option.delete({ id: option.id });
          }
        }
      }
    });
  } catch (error) {
    if (error.respond) {
      throw error; // Already a custom error with a responder
    } else {
      throw new DatabaseError('importing option sets', error);
    }
  }
  respond(res, { message: 'Imported option sets' });
}
