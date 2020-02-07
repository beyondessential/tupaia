// function pipe(...fns) {
//   return arg => fns.reduce((prev, fn) => fn(prev), arg);
// }

function pipe(...fns) {
  return arg => fns.reduce((chain, func) => chain.then(func), Promise.resolve(arg));
}

// const pipe = (...fns) => input => functions.reduce((chain, func) => chain.then(func), Promise.resolve(input));

export const superCoolFunctionalBuilder = (
  { dataBuilderConfig, query, organisationUnitInfo },
  dhisApi,
) => {
  const context = { dataBuilderConfig, query, organisationUnitInfo, dhisApi };

  return pipe(
    analyticsFetcher,
    countValues(context.dataBuilderConfig.valuesOfInterest),
    formatForFrontend,
  )(context);
};

async function analyticsFetcher({ dataBuilderConfig, query, organisationUnitInfo, dhisApi }) {
  const { results } = await dhisApi.getAnalytics(dataBuilderConfig, query);
  return results;
}

/** Higher Order Functions with additional args */
function countValues(valuesOfInterest) {
  return results => {
    return results.reduce((data, { value }) => {
      if (valuesOfInterest && !valuesOfInterest.includes(value)) {
        return { ...data }; // not interested in this value, ignore it
      }

      const existingValue = data[value];
      if (!existingValue) {
        const newValue = { value: 0, name: value };
        return { ...data, [value]: newValue };
      }

      existingValue.value += 1;
      return { ...data, [value]: existingValue };
    }, {});
  };
}

const formatForFrontend = data => {
  return { data: Object.values(data) };
};

/** ---------------------- EXAMPLES ---------------------- */

/** Higher Order Functions with additional args */
function groupByKeyFormatter(key) {
  return results =>
    results.reduce((a, c) => {
      const b = { ...a };
      b[c[key]] ? (b[c[key]] = [...b[c[key]], c]) : (b[c[key]] = [c]);
      return b;
    }, {});
}

function sumBuilder(results) {
  return Object.entries(results).map(([k, v]) => {
    const summed = v.reduce((a, c) => (a += c.value), 0);
    return { name: k, value: summed };
  });
}

/** Pipeable composition */

// format
function perPeriodFormatter(r) {
  return r.reduce((a, c) => {
    const b = { ...a };
    b[c.period] ? (b[c.period] = [...b[c.period], c]) : (b[c.period] = [c]);
    return b;
  }, {});
}

function perOrgFormatter(r) {
  return r.reduce((a, c) => {
    const b = { ...a };
    b[c.organisationUnit]
      ? (b[c.organisationUnit] = [...b[c.organisationUnit], c])
      : (b[c.organisationUnit] = [c]);
    return b;
  }, {});
}
