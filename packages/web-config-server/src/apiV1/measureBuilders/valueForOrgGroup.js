import { DataBuilder } from '/apiV1/dataBuilders/DataBuilder';
import { analyticsToMeasureData } from './helpers';

const FACILITY_TYPE_CODE = 'facilityTypeCode';
const SCHOOL_TYPE_CODE = 'schoolTypeCode';

class ValueForOrgGroupMeasureBuilder extends DataBuilder {
  async build() {
    const { data: facilitiesByCode, period } = await this.getFacilityDataByCode();

    return { data: Object.values(facilitiesByCode), period };
  }

  async getFacilityDataByCode() {
    const { dataElementCode } = this.query;

    // 'facilityTypeCode' signifies a special case which is handled internally
    if (dataElementCode === FACILITY_TYPE_CODE) {
      const { facilityTypeCodeMetadataKey = 'category_code' } = this.config;
      // create index of all facilities
      const facilityEntities = await this.fetchDescendantsOfType(this.models.entity.types.FACILITY);
      const facilityCodes = facilityEntities.map(facility => facility.code);
      const facilityMetaDatas = await this.models.facility.find({ code: facilityCodes });
      const facilitiesByCode = facilityMetaDatas.reduce((array, metadata) => {
        array.push({
          organisationUnitCode: metadata.code,
          facilityTypeCode: metadata[facilityTypeCodeMetadataKey],
          facilityTypeName: metadata.type_name,
        });
        return array;
      }, []);
      return {
        data: facilitiesByCode,
      };
    }
    if (dataElementCode === SCHOOL_TYPE_CODE) {
      const schools = await this.fetchDescendantsOfType(this.models.entity.types.SCHOOL);
      const facilitiesByCode = schools.map(school => ({
        organisationUnitCode: school.code,
        schoolTypeName: school.attributes.type,
        schoolTypeCode: school.attributes.type,
      }));
      return {
        data: facilitiesByCode,
      };
    }

    // There are cases that we want to group more than 1 data element codes.
    const dataElementCodes = this.config.dataElementCodes || [dataElementCode];

    const { results, period } = await this.fetchAnalytics(dataElementCodes, {
      organisationUnitCode: this.entity.code,
    });

    let analytics = results.map(result => ({
      ...result,
      value: result.value === undefined ? '' : result.value.toString(),
    }));

    // Temp solution for RN-523
    if (this.config.swapFwToFj) {
      analytics = analytics.map(analytic => ({
        ...analytic,
        organisationUnit: analytic.organisationUnit === 'FPBS' ? 'FJ' : analytic.organisationUnit,
      }));
    }

    // If we group multiple data element codes, dataElementCode is usually 'value'
    const customDataKey = this.config.dataElementCodes ? dataElementCode : null;

    return { data: analyticsToMeasureData(analytics, customDataKey), period };
  }
}

export const valueForOrgGroup = async (
  models,
  aggregator,
  dhisApi,
  query,
  measureBuilderConfig = {},
  entity,
) => {
  const builder = new ValueForOrgGroupMeasureBuilder(
    models,
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
