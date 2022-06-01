/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

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

    const existingDataElements = await transactingModels.dataElement.find({ code });
    if (existingDataElements.length > 0) {
      throw new ImportValidationError(`Data element code '${code}' already exists`, excelRowNumber);
    }

    await transactingModels.dataElement.create(dataElement);
  }
}
