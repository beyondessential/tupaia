import { Entity, Facility } from '/models';
import { DataBuilder } from '/apiV1/dataBuilders/DataBuilder';
import { analyticsToMeasureData } from './helpers';

const FACILITY_TYPE_CODE = 'facilityTypeCode';

class ValueForOrgGroupMeasureBuilder extends DataBuilder {
  async build() {
    const facilitiesByCode = await this.getFacilityDataByCode();

    return Object.values(facilitiesByCode);
  }

  async getFacilityDataByCode() {
    const { dataElementCode, organisationUnitGroupCode } = this.query;

    // 'facilityTypeCode' signifies a special case which is handled internally
    if (dataElementCode === FACILITY_TYPE_CODE) {
      // create index of all facilities
      const facilityCodes = (await Entity.getFacilitiesOfOrgUnit(organisationUnitGroupCode)).map(
        facility => facility.code,
      );
      const facilityMetaDatas = await Facility.find({ code: facilityCodes });
      return facilityMetaDatas.reduce(
        (array, metadata) => [
          ...array,
          {
            organisationUnitCode: metadata.code,
            facilityTypeCode: metadata.category_code,
            facilityTypeName: metadata.type_name,
          },
        ],
        [],
      );
    }

    const { results } = await this.fetchAnalytics([dataElementCode], {
      organisationUnitCode: organisationUnitGroupCode,
    });
    const analytics = results.map(result => ({
      ...result,
      value: result.value === undefined ? '' : result.value.toString(),
    }));
    return analyticsToMeasureData(analytics);
  }
}

export const valueForOrgGroup = async (aggregator, dhisApi, query, measureBuilderConfig = {}) => {
  const builder = new ValueForOrgGroupMeasureBuilder(
    aggregator,
    dhisApi,
    measureBuilderConfig,
    query,
    undefined,
    measureBuilderConfig.aggregationType,
  );
  const responseObject = await builder.build();

  return responseObject;
};
