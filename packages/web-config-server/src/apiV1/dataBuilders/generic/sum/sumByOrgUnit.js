import { DataBuilder } from '/apiV1/dataBuilders/DataBuilder';

class SumByOrgUnitBuilder extends DataBuilder {
  /**
   * @returns {SumAggregateSeriesOutput}
   */
  async build() {
    const { dataElementCodes, labels: labelsConfig } = this.config;

    const { results, period } = await this.fetchAnalytics(dataElementCodes);
    const dataByOrgUnit = {};
    results.forEach(({ organisationUnit, value }) => {
      dataByOrgUnit[organisationUnit] = (dataByOrgUnit[organisationUnit] || 0) + value;
    });
    const labels = labelsConfig || (await this.mapOrgUnitCodesToNames(Object.keys(dataByOrgUnit)));

    const returnData = Object.keys(dataByOrgUnit)
      .sort()
      .map(organisationUnit => ({
        name: labels && labels[organisationUnit] ? labels[organisationUnit] : organisationUnit,
        value: dataByOrgUnit[organisationUnit],
      }));
    return {
      data: returnData,
      period,
    };
  }
}

export const sumByOrgUnit = async (
  { models, dataBuilderConfig, query, entity },
  aggregator,
  dhisApi,
) => {
  const builder = new SumByOrgUnitBuilder(
    models,
    aggregator,
    dhisApi,
    dataBuilderConfig,
    query,
    entity,
    dataBuilderConfig.aggregationType,
  );
  return builder.build();
};
