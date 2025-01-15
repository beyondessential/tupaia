import { ImportValidationError } from '@tupaia/utils';

export async function createDataElements(transactingModels, dataElements) {
  const codes = [];
  for (let i = 0; i < dataElements.length; i++) {
    const dataElement = dataElements[i];
    const excelRowNumber = i + 2;
    const { code } = dataElement;

    if (codes.includes(code)) {
      throw new ImportValidationError(
        `Data element code '${code}' is not unique in the uploaded file`,
        excelRowNumber,
      );
    }
    codes.push(code);

    const existingDataElement = await transactingModels.dataElement.find({ code });
    if (existingDataElement.length > 0) {
      await transactingModels.dataElement.update({ code }, dataElement);
    } else {
      await transactingModels.dataElement.create(dataElement);
    }
  }
}
