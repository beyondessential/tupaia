import xlsx from 'xlsx';
import { respondWithDownload, toFilename } from '@tupaia/utils';
import { getExportPathForUser } from '@tupaia/server-utils';

const objectToHumanReadableKeyValuePairs = obj => {
  const entries = [];
  for (const [key, value] of Object.entries(obj)) {
    entries.push(`${key}: ${value}`);
  }
  return entries.join('\n');
};

export async function exportOptionSet(req, res) {
  const { models, userId } = req;
  const { optionSetId } = req.params;

  const optionSetRecord = await models.optionSet.findOne({ id: optionSetId });
  const optionRecords = await optionSetRecord.options();
  const options = optionRecords.map(option => {
    return {
      value: option.value,
      label: option.label,
      sort_order: option.sort_order,
      attributes: objectToHumanReadableKeyValuePairs(option.attributes),
    };
  });

  const worksheet = xlsx.utils.json_to_sheet(options);
  const sheetName = optionSetRecord.name.substring(0, 31); // Sheet name max. length is hard-coded in Excel

  // Upgrade xlsx to v0.20 or newer to do next two lines in one go
  const workbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(workbook, worksheet, sheetName);

  const dirname = getExportPathForUser(userId);
  const basename = toFilename(`Option Set - ${optionSetRecord.name}.xlsx`);
  const filepath = `${dirname}/${basename}`;
  xlsx.writeFile(workbook, filepath);

  respondWithDownload(res, filepath);
}
