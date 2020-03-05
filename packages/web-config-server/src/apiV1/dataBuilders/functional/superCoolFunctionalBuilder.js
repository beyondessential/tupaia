import { inspect } from 'util';

import { fetchAnalytics, fetchDataElementCodesFromGroup } from './fetchers/analytics';
import { countValues } from './builders/count';
import { formatForFrontend } from './formatters/values';

const superCoolNodeTrace = label => value => {
  console.log(`${label}: ${inspect(value, false, null, true)}`);
  return value;
};

async function superCoolRecursivePipe(fns, context, result) {
  if (fns.length === 0) return result;

  const next = [...fns];
  const step = next.shift();
  const res = await step(result, context);

  return superCoolRecursivePipe(next, context, res);
}

/** This would need to change to get the functions to pass the the pipe out of some config */
export const superCoolFunctionalBuilder = (
  { dataBuilderConfig, query, entity, dataSource },
  aggregator,
  dhisApi,
) => {
  /** Looking into better ways to provide this data to the piped functions. */
  const context = { dataBuilderConfig, query, dhisApi, aggregator, entity, dataSource };

  return superCoolRecursivePipe(
    [
      fetchDataElementCodesFromGroup,
      fetchAnalytics(aggregator.aggregationTypes.MOST_RECENT),
      countValues,
      superCoolNodeTrace('counted values: '),
      formatForFrontend,
      superCoolNodeTrace('final result: '),
    ],
    context,
  );
};

/** ---------------------- EXAMPLES OF OTHER FUNCTIONS ---------------------- */
/** group results by any key */
// function groupByKeyFormatter(key = 'period') {
//   return results =>
//     results.reduce((a, c) => {
//       const b = { ...a };
//       b[c[key]] ? (b[c[key]] = [...b[c[key]], c]) : (b[c[key]] = [c]);
//       return b;
//     }, {});
// }

// /** sum results */
// function sumBuilder(results) {
//   return Object.entries(results).map(([k, v]) => {
//     const summed = v.reduce((a, c) => (a += c.value), 0);
//     return { name: k, value: summed };
//   });
// }
