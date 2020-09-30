/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { upsertDummyRecord } from './upsertDummyRecord';

/**
 * Generates test data, and stores it in the database. Uses test ids so that all can be cleanly
 * wiped afterwards. Any missing fields on the records passed in are generated randomly or using
 * sensible defaults, using the logic in upsertDummyRecord
 * @param {} recordsByModelType
 */
export const populateTestData = async (models, recordsByModelType) => {
  const modelTypes = Object.keys(recordsByModelType);
  // process sequentially, as some inserts may depend on earlier foreign keys being inserted
  for (let i = 0; i < modelTypes.length; i++) {
    const modelType = modelTypes[i];
    for (const record of recordsByModelType[modelType]) {
      await upsertDummyRecord(models[modelType], record);
    }
  }
};
