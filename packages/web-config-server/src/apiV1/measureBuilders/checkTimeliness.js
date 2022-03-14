import { DataBuilder } from '/apiV1/dataBuilders/DataBuilder';
import { getDateRange } from '/apiV1/utils';
import { periodToMoment } from '@tupaia/utils';

class CheckTimelinessMeasureBuilder extends DataBuilder {
  async build() {
    const { periodGranularity } = this.config;
    const { dataElementCode, startDate: passedStartDate, endDate: passedEndDate } = this.query;
    const { startDate, endDate } = getDateRange(periodGranularity, passedStartDate, passedEndDate);

    const dhisParameters = {
      dataElementGroupCode: dataElementCode,
      orgUnitIdScheme: 'code',
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    };
    const results = await this.dhisApi.getDataValuesInSets(dhisParameters, this.entity);

    // annotate each facility with the corresponding data from dhis
    return {
      data: results.map(row => ({
        organisationUnitCode: row.organisationUnit,
        [dataElementCode]: row.value === undefined ? '' : row.value.toString(),
        submissionDate: periodToMoment(row.period.toString()).format('YYYY-MM-DD'),
      })),
    };
  }
}

/**
 * @param {DhisApi} dhisApi
 * @param {Object} query
 * @param {Object} [measureBuilderConfig={}]
 * @returns {Promise<Object>}
 */
export const checkTimeliness = async (
  models,
  aggregator,
  dhisApi,
  query,
  measureBuilderConfig = {},
  entity,
) => {
  const builder = new CheckTimelinessMeasureBuilder(
    models,
    aggregator,
    dhisApi,
    measureBuilderConfig,
    query,
    entity,
  );
  const responseObject = await builder.build();

  return responseObject;
};
