import xlsx from 'xlsx';

import { DatabaseError, respond, ObjectValidator, fieldHasContent } from '@tupaia/utils';
import { assertBESAdminAccess } from '../../permissions';

const TAB_NAMES = {
  DISASTER: 'Disaster',
  DISASTER_EVENT: 'DisasterEvent',
  ENTITY: 'Entity',
};

const disasterFieldValidators = {
  id: [fieldHasContent],
  type: [fieldHasContent],
  description: [fieldHasContent],
  name: [fieldHasContent],
  countryCode: [fieldHasContent],
};

const entityFieldValidators = {
  id: [],
  point: [fieldHasContent],
  code: [fieldHasContent],
  parent_id: [fieldHasContent],
  name: [fieldHasContent],
  country_code: [fieldHasContent],
};

const disasterEventFieldValidators = {
  id: [fieldHasContent],
  date: [fieldHasContent],
  type: [fieldHasContent],
  organisationUnitCode: [fieldHasContent],
  disasterId: [fieldHasContent],
};

export async function importDisaster(req, res) {
  const { models } = req;

  await req.assertPermissions(assertBESAdminAccess);

  try {
    const workbook = xlsx.readFile(req.file.path);

    const getDataAndValidate = async (sheet, validater) => {
      const sheetData = xlsx.utils.sheet_to_json(sheet);
      const createDisasterValidater = new ObjectValidator(validater);

      await createDisasterValidater.validate(sheetData[0]);
      return sheetData;
    };

    await models.wrapInTransaction(async transactingModels => {
      for (const disasterSheet of Object.entries(workbook.Sheets)) {
        const [tabName, sheet] = disasterSheet;

        switch (tabName) {
          case TAB_NAMES.DISASTER: {
            const sheetData = await getDataAndValidate(sheet, disasterFieldValidators);

            sheetData.forEach(async entry => {
              await transactingModels.disaster.updateOrCreate(
                {
                  id: entry.id,
                },
                entry,
              );
            });

            break;
          }
          case TAB_NAMES.DISASTER_EVENT: {
            const sheetData = await getDataAndValidate(sheet, disasterEventFieldValidators);

            for (const entry of sheetData) {
              await transactingModels.disasterEvent.updateOrCreate(
                {
                  id: entry.id,
                },
                entry,
              );
            }

            break;
          }
          case TAB_NAMES.ENTITY: {
            const sheetData = await getDataAndValidate(sheet, entityFieldValidators);

            const intialData = sheetData.map(item => {
              return {
                code: item.code,
                parent_id: item.parent_id,
                name: item.name,
                country_code: item.country_code,
                type: transactingModels.entity.types.DISASTER,
              };
            });

            for (const entry of intialData) {
              await transactingModels.entity.updateOrCreate(
                {
                  code: entry.code,
                },
                entry,
              );
            }

            for (const entry of sheetData) {
              await transactingModels.entity.updatePointCoordinatesFormatted(
                entry.code,
                entry.point,
              );
            }
            break;
          }
          default:
          // just ignore any tabs we're not interested in
        }
      }
    });
  } catch (error) {
    if (error.respond) {
      throw error; // Already a custom error with a responder
    } else {
      throw new DatabaseError('importing disaster sets', error);
    }
  }
  respond(res, { message: 'Imported disaster details' });
}
