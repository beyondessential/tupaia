/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { ImportValidationError } from '@tupaia/utils';

export async function createDataSources(transactingModels, dataSources) {
  const codes = [];
  for (let i = 0; i < dataSources.length; i++) {
    const dataSource = dataSources[i];
    const excelRowNumber = i + 2;
    const { code } = dataSource;
    try {
      if (codes.includes(code)) {
        throw new Error(`Data source code '${code}' is not unique in the uploaded file`);
      }
      codes.push(code);

      const exsitingDataSource = await transactingModels.dataSource.find({ code });
      if (exsitingDataSource.length > 0) {
        throw new Error(`Data source code '${code}' already exists`);
      }

      await transactingModels.dataSource.create(dataSource);
    } catch (e) {
      throw new ImportValidationError(e.message, excelRowNumber);
    }
  }
}
