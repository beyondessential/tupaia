/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { DatabaseError, ImportValidationError } from '@tupaia/utils';

export async function createDataSources(transactingModels, dataSources) {
  const codes = [];
  for (let i = 0; i < dataSources.length; i++) {
    const dataSource = dataSources[i];
    const excelRowNumber = i + 2;
    const { code } = dataSource;
    try {
      if (codes.includes(code)) {
        throw new ImportValidationError(
          `Data source code '${code}' is not unique in the uploaded file`,
          excelRowNumber,
        );
      }
      codes.push(code);

      const exsitingDataSource = await transactingModels.dataSource.find({ code });
      if (exsitingDataSource.length > 0) {
        throw new ImportValidationError(
          `Data source code '${code}' already exists`,
          excelRowNumber,
        );
      }

      await transactingModels.dataSource.create(dataSource);
    } catch (e) {
      throw new DatabaseError('creating data source', e);
    }
  }
}
