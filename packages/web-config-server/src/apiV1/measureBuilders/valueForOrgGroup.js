import keyBy from 'lodash.keyby';

import { Entity } from '/models/Entity';
import { DataBuilder } from '/apiV1/dataBuilders/DataBuilder';

const FACILITY_TYPE_CODE = 'facilityTypeCode';

class ValueForOrgGroupMeasureBuilder extends DataBuilder {
  async build() {
    const facilitiesByCode = await this.getFacilityDataByCode();

    return Object.values(facilitiesByCode);
  }

  async getFacilityDataByCode() {
    const { dataElementCode, organisationUnitGroupCode } = this.query;

    const formatFacilityEntities = facility => {
      if (dataElementCode === FACILITY_TYPE_CODE) {
        return {
          organisationUnitCode: facility.code,
          facilityTypeCode: facility.facility_category_code,
          facilityTypeName: facility.facility_type_name,
        };
      }

      return {
        organisationUnitCode: facility.code,
      };
    };

    // create index of all facilities
    const facilityCodes = (await Entity.getFacilitiesOfOrgUnit(organisationUnitGroupCode)).map(
      formatFacilityEntities,
    );
    const facilityData = keyBy(facilityCodes, 'organisationUnitCode');

    // 'facilityTypeCode' signifies a special case which is handled internally
    if (dataElementCode === FACILITY_TYPE_CODE) {
      return facilityData;
    }

    const { results } = await this.fetchAnalytics([dataElementCode], {
      organisationUnitCode: organisationUnitGroupCode,
    });
    // annotate each facility with the corresponding data from dhis
    results.forEach(row => {
      const data = facilityData[row.organisationUnit];
      if (data) {
        data[dataElementCode] = row.value === undefined ? '' : row.value.toString();
      }
    });

    return facilityData;
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
