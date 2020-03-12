import { DataBuilder } from '/apiV1/dataBuilders/DataBuilder';
import { getDateRange } from '/apiV1/utils';

class CheckTimelinessMeasureBuilder extends DataBuilder {
  async build() {
    const { periodGranularity } = this.config;
    const {
      dataElementCode,
      organisationUnitGroupCode,
      startDate: passedStartDate,
      endDate: passedEndDate,
    } = this.query;
    const { startDate, endDate } = getDateRange(periodGranularity, passedStartDate, passedEndDate);

    const dhisParameters = {
      dataElementGroupCode: dataElementCode,
      orgUnitIdScheme: 'code',
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    };
    const query = {
      organisationUnitCode: organisationUnitGroupCode,
    };
    const results = await this.dhisApi.getDataValuesInSets(dhisParameters, query);

    // annotate each facility with the corresponding data from dhis
    return results.map(row => ({
      organisationUnitCode: row.organisationUnit,
      [dataElementCode]: row.value === undefined ? '' : row.value.toString(),
    }));
  }
}

/**
 * @param {DhisApi} dhisApi
 * @param {Object} query
 * @param {Object} [measureBuilderConfig={}]
 * @returns {Promise<Object>}
 */
export const checkTimeliness = async (aggregator, dhisApi, query, measureBuilderConfig = {}) => {
  const builder = new CheckTimelinessMeasureBuilder(
    aggregator,
    dhisApi,
    measureBuilderConfig,
    query,
  );
  const responseObject = await builder.build();

  return responseObject;
};

export const getLevel = measureBuilderConfig => measureBuilderConfig.level;
