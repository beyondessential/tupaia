const pipe = (...fns) => x => fns.reduce((y, f) => f(y), x);

/**
 * @param {[Function]} connections
 */
const buildPipeline = connections => pipe(...connections);

export const buildContext = async ({ dataBuilderConfig, query, organisationUnitInfo }, dhisApi) => {
  const context = { dataBuilderConfig, query, dhisApi };

  // need to give each function this context
  const build = pipe(analyticsFetcher, perOrgFormatter, sumBuilder);

  return build();
};

function groupByKeyFormatter(r) {
  return r.reduce((a, c) => {
    const b = { ...a };
    b[c[this.key]] ? (b[c[this.key]] = [...b[c[this.key]], c]) : (b[c[this.key]] = [c]);
    return b;
  }, {});
}

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

function sumBuilder(r) {
  return Object.entries(r).map(([k, v]) => {
    const summed = v.reduce((a, c) => (a += c.value), 0);
    return { name: k, value: summed };
  });
}
