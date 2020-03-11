import keyBy from 'lodash.keyby';

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

    // create index of all facilities
    const facilityCodes = (await Entity.getFacilitiesOfOrgUnit(organisationUnitGroupCode)).map(
      facility => ({
        organisationUnitCode: facility.code,
      }),
    );
    const facilityData = keyBy(facilityCodes, 'organisationUnitCode');

    // 'facilityTypeCode' signifies a special case which is handled internally
    if (dataElementCode === FACILITY_TYPE_CODE) {
      const facilityMetaDatas = await Facility.find({ code: Object.keys(facilityData) });
      facilityMetaDatas.forEach(metadata => {
        facilityData[metadata.code] = {
          organisationUnitCode: metadata.code,
          facilityTypeCode: metadata.category_code,
          facilityTypeName: metadata.type_name,
        };
        return true;
      });
      return facilityData;
    }

    const { results } = await this.fetchAnalytics([dataElementCode], {
      organisationUnitCode: organisationUnitGroupCode,
    });
    // annotate each facility with the corresponding data from dhis
    return results.map(row => ({
      organisationUnitCode: row.organisationUnit,
      [dataElementCode]: row.value,
    }));
  }
}

export const valueForOrgGroup = async (aggregator, dhisApi, query, measureBuilderConfig = {}) => {
  const builder = new ValueForOrgGroupMeasureBuilder(
    aggregator,
    dhisApi,
    measureBuilderConfig,
    query,
  );
  const responseObject = await builder.build();

  return responseObject;
};

export const getLevel = measureBuilderConfig =>
  measureBuilderConfig.level || measureBuilderConfig.organisationLevel;
