import { Entity, Facility } from '/models';
import { DataBuilder } from '/apiV1/dataBuilders/DataBuilder';

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
    // annotate each facility with the corresponding data from dhis
    return results.map(row => ({
      organisationUnitCode: row.organisationUnit,
      [dataElementCode]: row.value === undefined ? '' : row.value.toString(),
    }));
  }
}

export const valueForOrgGroup = async (aggregator, dhisApi, query, measureBuilderConfig = {}) => {
  const builder = new ValueForOrgGroupMeasureBuilder(
    aggregator,
    dhisApi,
    measureBuilderConfig,
    query,
    undefined,
    measureBuilderConfig.aggregatorType,
  );
  const responseObject = await builder.build();

  return responseObject;
};
