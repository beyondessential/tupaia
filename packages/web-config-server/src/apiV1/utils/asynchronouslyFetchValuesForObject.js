/**
 * Takes in an object specification in the form
 * {
 *    key1: asynchronousValueFetchingFunction1,
 *    key2: asynchronousValueFetchingFunction2,
 * }
 * and runs the asynchronous value fetching functions in parallel, returning the object with the
 * values filled in the keys matching the structure passed in.
 * E.g.
 * const temparatures = await asynchronouslyFetchValuesForObject({
 *    currentTemperature: asyncFetchTempFromApi,
 *    yesterdaysTemperature: () => database.findOne('temparature', { date: new Date().getDate() - 1 }),
 * });
 * console.log(temperatures);
 * Might print
 * {
 *    currentTemperature: 24,
 *    yesterdaysTemperature: 22,
 * }
 * @param {object} objectSpecification    An object specifying the keys to be filled in the return
 *                                        object, along with asynchronous functions to fill each
 */
export const asynchronouslyFetchValuesForObject = async objectSpecification => {
  const returnObject = {};
  await Promise.all(
    Object.entries(objectSpecification).map(async ([key, asyncronouslyFetchValue]) => {
      returnObject[key] = await asyncronouslyFetchValue();
    }),
  );
  return returnObject;
};
