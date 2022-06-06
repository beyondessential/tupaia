/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { ImportValidationError } from '@tupaia/utils';

export async function createDataElements(transactingModels, dataElements) {
  const codes = [];
  for (let i = 0; i < dataElements.length; i++) {
    const dataSource = dataElements[i];
    const excelRowNumber = i + 2;
    const { code } = dataSource;

    if (codes.includes(code)) {
      throw new ImportValidationError(
        `Data source code '${code}' is not unique in the uploaded file`,
        excelRowNumber,
      );
    }
    codes.push(code);

    const exsitingDataSource = await transactingModels.dataSource.find({ code });
    if (exsitingDataSource.length > 0) {
      await transactingModels.dataSource.update({ code }, dataSource);
    } else {
      await transactingModels.dataSource.create(dataSource);
    }
  }
}
