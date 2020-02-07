import { basicFetch } from './fetchers/analytics';
import { countValues } from './builders/count';
import { formatForFrontend } from './formatters/values';

/** pipe with async support */
function pipe(...fns) {
  return arg => fns.reduce((chain, func) => chain.then(func), Promise.resolve(arg));
}

/** This would need to change to get the functions to pass the the pipe out of some config */
export const superCoolFunctionalBuilder = (
  { dataBuilderConfig, query, organisationUnitInfo },
  dhisApi,
) => {
  /** Looking into better ways to provide this data to the piped functions. */
  const context = { dataBuilderConfig, query, organisationUnitInfo, dhisApi };

  return pipe(
    basicFetch,
    countValues(context.dataBuilderConfig.valuesOfInterest),
    formatForFrontend,
  )(context);
};

/** ---------------------- EXAMPLES OF OTHER FUNCTIONS ---------------------- */
/** group results by any key */
function groupByKeyFormatter(key = 'period') {
  return results =>
    results.reduce((a, c) => {
      const b = { ...a };
      b[c[key]] ? (b[c[key]] = [...b[c[key]], c]) : (b[c[key]] = [c]);
      return b;
    }, {});
}

/** sum results */
function sumBuilder(results) {
  return Object.entries(results).map(([k, v]) => {
    const summed = v.reduce((a, c) => (a += c.value), 0);
    return { name: k, value: summed };
  });
}

/** Pipeable composition!!! */
function odds(array) {
  return array.filter(x => x % 2 === 0);
}

function multiplyBy(x) {
  return array => array.map(n => n * x);
}

/**
 * this can now be passed to the build pipeline!
 * Real world example could be:
 * const average = pipe(sumValues, divideBy(values.length));
 */
const tripleTheOdds = pipe(odds, multiplyBy(3));
