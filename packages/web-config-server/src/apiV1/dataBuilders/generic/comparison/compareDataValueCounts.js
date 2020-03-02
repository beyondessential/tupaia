/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { DataBuilder } from '/apiV1/dataBuilders/DataBuilder';

class CompareDataValueCountsBuilder extends DataBuilder {
  async build() {
    return { data: [] };
  }

  fetchData() {
    // ...
    const a = {
      dataClasses: {
        'Number of facilities using stock cards for RH commodities': {
          numerator: {
            elementsToComparePerFacility: {
              compareCounts: [dx, dx, dx],
              compareToCounts: [dx, dx, dx],
            },
          },
          denominator: '$orgUnitCount',
        },
        'Number of facilities with updated stock cards for RH commodities': {
          numerator: {
            dataValues: {
              RHS6UNFPA1211: 1,
              RHS6UNFPA1224: 1,
              RHS6UNFPA1237: 1,
              RHS6UNFPA1250: 1,
              RHS6UNFPA1263: 1,
              RHS6UNFPA1276: 1,
              RHS6UNFPA1289: 1,
              RHS6UNFPA1302: 1,
            },
          },
          denominator: '$orgUnitCount',
        },
      },
    };
  }

  // fetch all data most recent
  // compare pairs per facility:
  /**
   
    {
      pairs: {

      }
    }

   */
}

function compareDataValueCounts(queryConfig, aggregator, dhisApi, aggregationType) {
  const { dataBuilderConfig, query, entity } = queryConfig;
  const builder = new CompareDataValueCountsBuilder(
    aggregator,
    dhisApi,
    dataBuilderConfig,
    query,
    entity,
  );
  return builder.build();
}
