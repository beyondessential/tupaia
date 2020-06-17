import { DataBuilder } from '/apiV1/dataBuilders/DataBuilder';
import { analyticsToMeasureData } from './helpers';
import { Entity } from '/models/Entity';

import { inspect } from 'util';

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

    const dataSources = this.config.dataSources;
    console.log('RegionalShadeTest -> build -> dataSources', dataSources);
    const dataElementCode = this.query.dataElementCode;

    const jobs = dataSources.map(dataSource =>
      this.fetchAnalytics([dataElementCode], {
        organisationUnitCode: dataSource,
      }),
    );

    const results = await Promise.all(jobs);

    const b = [
      {
        results: [
          {
            dataElement: 'MOS_3b3444bf',
            organisationUnit: 'VU_1180_20',
            period: '20200531',
            value: 4.210197449039,
          },
        ],
        metadata: { dataElementCodeToName: { MOS_3b3444bf: 'Condoms, maleMonths of Stock' } },
      },
    ];

    let analytics;
    for (const result of results) {
      if (result.results.length > 0) {
        const { value, organisationUnit } = result.results[0];
        console.log(value, organisationUnit);
      }
    }

    return [{ organisationUnitCode: 'VU', regional_shade_test: '3-6' }];
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
