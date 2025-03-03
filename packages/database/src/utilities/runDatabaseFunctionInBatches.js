// some part of knex or node-pg struggles with too many bindings, so we batch them in some places
// errors occurred at around 5000 bindings in initial testing, but more is needed - see issue #2197
export const MAX_BINDINGS_PER_QUERY = 2500;

export async function runDatabaseFunctionInBatches(
  arrayToBeBatched,
  databaseFunction,
  batchSize = MAX_BINDINGS_PER_QUERY,
) {
  const batches = [];
  for (let i = 0; i < arrayToBeBatched.length; i += batchSize) {
    batches.push(arrayToBeBatched.slice(i, i + batchSize));
  }
  const batchedResults = await Promise.all(batches.map(async b => databaseFunction(b)));
  return batchedResults.filter(r => Array.isArray(r)).flat();
}
