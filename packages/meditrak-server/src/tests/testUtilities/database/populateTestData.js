/**
 * Tupaia MediTrak
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { upsertDummyRecord } from '@tupaia/database';
import { getModels } from '../../getModels';

const models = getModels();

/**
 * Generates test data, and stores it in the database. Uses test ids so that all can be cleanly
 * wiped afterwards. Any missing fields on the records passed in are generated randomly or using
 * sensible defaults, using the logic in upsertDummyRecord (see @tupaia/database)
 * @param {} recordsByModelType
 */
export const populateTestData = async recordsByModelType => {
  const modelTypes = Object.keys(recordsByModelType);
  // process sequentially, as some inserts may depend on earlier foreign keys being inserted
  for (let i = 0; i < modelTypes.length; i++) {
    const modelType = modelTypes[i];
    await Promise.all(
      recordsByModelType[modelType].map(record => upsertDummyRecord(models[modelType], record)),
    );
  }
};
