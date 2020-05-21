import { Project, Facility } from '/models';
import { DataBuilder } from '/apiV1/dataBuilders/DataBuilder';
import { analyticsToMeasureData } from './helpers';
import { ENTITY_TYPES } from '/models/Entity';

const FACILITY_TYPE_CODE = 'facilityTypeCode';
const SCHOOL_TYPE_CODE = 'schoolTypeCode';

class ValueForOrgGroupMeasureBuilder extends DataBuilder {
  async build() {
    const facilitiesByCode = await this.getFacilityDataByCode();

    return Object.values(facilitiesByCode);
  }

  async getFacilityDataByCode() {
    const { dataElementCode, projectCode } = this.query;

    // 'facilityTypeCode' signifies a special case which is handled internally
    if (dataElementCode === FACILITY_TYPE_CODE) {
      // create index of all facilities
      const project = await Project.findOne({ code: projectCode });
      const facilityCodes = (await this.entity.getFacilities(project.entity_hierarchy_id)).map(
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
    } else if (dataElementCode === SCHOOL_TYPE_CODE) {
      const project = await Project.findOne({ code: projectCode });
      const schools = await this.entity.getDescendantsOfType(
        ENTITY_TYPES.SCHOOL,
        project.entity_hierarchy_id,
      );
      return schools.map(school => ({
        organisationUnitCode: school.code,
        schoolTypeName: school.attributes.type,
        schoolTypeCode: school.attributes.type,
      }));
    }

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

export const valueForOrgGroup = async (
  aggregator,
  dhisApi,
  query,
  measureBuilderConfig = {},
  entity,
) => {
  const builder = new ValueForOrgGroupMeasureBuilder(
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
