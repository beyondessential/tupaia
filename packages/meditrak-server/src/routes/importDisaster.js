import xlsx from 'xlsx';
import { respond } from '../respond';
import { DatabaseError } from '../errors';

export async function importDisaster(req, res) {
  const { models } = req;

  try {
    const workbook = xlsx.readFile(req.file.path);
    await models.wrapInTransaction(async transactingModels => {
      for (const disasterSheet of Object.entries(workbook.Sheets)) {
        const [tabName, sheet] = disasterSheet;

        if (tabName === 'Disaster') {
          console.log('at 1');
          console.log(xlsx.utils.sheet_to_json(sheet));
          const sheetData = xlsx.utils.sheet_to_json(sheet);
          await transactingModels.disaster.updateOrCreate(
            {
              id: sheetData[0].id,
            },
            sheetData[0],
          );
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
