/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

// some part of knex or node-pg struggles with too many bindings, so we batch them in some places
export const MAX_BINDINGS_PER_QUERY = 2500; // errors occurred at around 5000 bindings in testing

export async function runDatabaseFunctionInBatches(arrayToBeBatched, databaseFunction) {
  const result = [];
  const batchSize = MAX_BINDINGS_PER_QUERY;
  for (let i = 0; i < arrayToBeBatched.length; i += batchSize) {
    const batch = arrayToBeBatched.slice(i, i + batchSize);
    const resultForBatch = await databaseFunction(batch);
    if (Array.isArray(resultForBatch)) {
      result.push(...resultForBatch);
    }
  }
  return result;
}
