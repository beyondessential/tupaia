import { Facility } from '/models';
import { DataBuilder } from '/apiV1/dataBuilders/DataBuilder';
import { analyticsToMeasureData } from './helpers';
import { ENTITY_TYPES } from '/models/Entity';

const FACILITY_TYPE_CODE = 'facilityTypeCode';
const SCHOOL_TYPE_CODE = 'schoolTypeCode';

class RegionalShadeTest extends DataBuilder {
  async build() {
    // ==== regionalShadeTest:11 ====
    // { measureId: 'regional_shade_test',
    //   organisationUnitCode: 'unfpa',
    //   projectCode: 'unfpa',
    //   shouldShowAllParentCountryResults: 'false',
    //   cacheBreaker: '2e6pxs',
    //   dataElementCode: 'MOS_3b3444bf' }
    // --------------------------------------

    const dataSource = this.config.dataSourceEntity;
    const dataElementCode = this.query.dataElementCode;
    const { results } = await this.fetchAnalytics([dataElementCode], {
      organisationUnitCode: dataSource,
    });
    console.log('==== regionalShadeTest:25 ====');
    console.log(results);
    console.log('--------------------------------------');

    return [];
  }

  async getFacilityDataByCode() {
    const { dataElementCode } = this.query;

    const { results } = await this.fetchAnalytics([dataElementCode], {
      organisationUnitCode: this.entity.code,
    });
    const analytics = results.map(result => ({
      ...result,
      value: result.value === undefined ? '' : result.value.toString(),
    }));
    return analyticsToMeasureData(analytics);
  }
}

export const regionalShadeTest = async (
  aggregator,
  dhisApi,
  query,
  measureBuilderConfig = {},
  entity,
) => {
  const builder = new RegionalShadeTest(
    aggregator,
    dhisApi,
    measureBuilderConfig,
    query,
    entity,
    measureBuilderConfig.aggregationType,
  );
  const responseObject = await builder.build();

  return responseObject;
};
