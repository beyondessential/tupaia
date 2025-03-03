import { reduceToDictionary } from '@tupaia/utils';

import { DataBuilder } from '/apiV1/dataBuilders/DataBuilder';
import { fetchOperationalFacilityCodes } from '/apiV1/utils';

class CountOperationalFacilitiesByCountryBuilder extends DataBuilder {
  async build() {
    const operationalFacilityCodes = await fetchOperationalFacilityCodes(
      this.aggregator,
      this.entity.code,
      this.period,
    );
    const facilityEntities = await this.fetchDescendantsOfType(this.models.entity.types.FACILITY);
    const countsByCountryCode = {};
    facilityEntities.forEach(({ code, country_code: countryCode }) => {
      if (operationalFacilityCodes.includes(code)) {
        countsByCountryCode[countryCode] = (countsByCountryCode[countryCode] || 0) + 1;
      }
    });
    const countryNamesByCode = await this.fetchCountryNamesByCode();
    const responseData = Object.entries(countsByCountryCode)
      .filter(([countryCode]) => countryCode !== 'DL') // exclude Demo Land from the count
      .map(([countryCode, count]) => ({ name: countryNamesByCode[countryCode], value: count }));
    return {
      data: this.sortDataByName(responseData),
    };
  }

  async fetchCountryNamesByCode() {
    const countryEntities = await this.fetchDescendantsOfType(this.models.entity.types.COUNTRY);
    return reduceToDictionary(countryEntities, 'code', 'name');
  }
}

export const countOperationalFacilitiesByCountry = async (queryConfig, aggregator, dhisApi) => {
  const { models, dataBuilderConfig, query, entity } = queryConfig;
  const builder = new CountOperationalFacilitiesByCountryBuilder(
    models,
    aggregator,
    dhisApi,
    dataBuilderConfig,
    query,
    entity,
  );
  return builder.build();
};
