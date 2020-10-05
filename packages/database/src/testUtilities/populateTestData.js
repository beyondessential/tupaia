/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { QUERY_CONJUNCTIONS } from '../TupaiaDatabase';
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
  for (const modelType of modelTypes) {
    for (const record of recordsByModelType[modelType]) {
      await upsertDummyRecord(models[modelType], record);
    }
  }
};

const { OR } = QUERY_CONJUNCTIONS;
function findLeafOr(criteria) {
  if (criteria[OR] === undefined) {
    return criteria;
  }
  return findLeafOr(criteria[OR]);
}

export const depopulateTestData = async (models, recordsByModelType) => {
  const modelTypes = Object.keys(recordsByModelType);
  // process sequentially, as some deletes may depend on earlier foreign keys being deleted
  for (const modelType of modelTypes) {
    const criteria = {};
    for (const record of recordsByModelType[modelType]) {
      const leafOr = findLeafOr(criteria);
      leafOr[OR] = { ...record };
    }
    await models[modelType].delete(criteria);
  }
};
