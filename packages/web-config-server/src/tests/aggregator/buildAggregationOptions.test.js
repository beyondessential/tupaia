/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';
import sinon from 'sinon';
import { Aggregator } from '@tupaia/aggregator';
import { EntityType } from '@tupaia/database';

import { buildAggregationOptions } from '/aggregator/buildAggregationOptions';

const createDataSourceEntity = (code, name, type, ancestors) => {
  const dataSourceEntity = sinon.createStubInstance(EntityType);
  dataSourceEntity.getAncestorOfType.callsFake((ancestorType, hierarchyId) => {
    return ancestors[`${ancestorType}_${hierarchyId}`];
  });
  dataSourceEntity.code = code;
  dataSourceEntity.name = name;
  dataSourceEntity.type = type;
  return dataSourceEntity;
};

const HIERARCHY_ID = '5e9d06e261f76a30c400001b';
const BASIC_AGGREGATION_OPTIONS = { aggregationType: 'SUM_MOST_RECENT_PER_FACILITY', filter: {} };
const BASIC_ENTITY_AGGREGATION_OPTIONS = {
  dataSourceEntityType: 'facility',
};
const BASIC_DATA_SOURCE_ENTITIES = [
  createDataSourceEntity('f1', 'Facility 1', 'facility', {
    [`district_${HIERARCHY_ID}`]: createDataSourceEntity('d9', 'District 9', 'district'),
  }),
];

describe('buildAggregationOptions', () => {
  it('should build basic aggregation options', async () => {
    return expect(
      buildAggregationOptions(
        BASIC_AGGREGATION_OPTIONS,
        BASIC_DATA_SOURCE_ENTITIES,
        BASIC_ENTITY_AGGREGATION_OPTIONS,
        HIERARCHY_ID,
      ),
    ).to.eventually.deep.equal({
      aggregations: [{ type: 'SUM_MOST_RECENT_PER_FACILITY', config: undefined }],
      filter: {},
    });
  });

  it('should build basic aggregation options and entity aggregation options', async () => {
    return expect(
      buildAggregationOptions(
        BASIC_AGGREGATION_OPTIONS,
        BASIC_DATA_SOURCE_ENTITIES,
        { ...BASIC_ENTITY_AGGREGATION_OPTIONS, aggregationEntityType: 'district' },
        HIERARCHY_ID,
      ),
    ).to.eventually.deep.equal({
      aggregations: [
        { type: 'SUM_MOST_RECENT_PER_FACILITY', config: undefined },
        {
          type: Aggregator.aggregationTypes.REPLACE_ORG_UNIT_WITH_ORG_GROUP,
          config: {
            orgUnitMap: { f1: { code: 'd9', name: 'District 9' } },
          },
        },
      ],
      filter: {},
    });
  });

  it('should build basic aggregation options without redundant entity aggregation options', async () => {
    return expect(
      buildAggregationOptions(
        BASIC_AGGREGATION_OPTIONS,
        BASIC_DATA_SOURCE_ENTITIES,
        { ...BASIC_ENTITY_AGGREGATION_OPTIONS, aggregationEntityType: 'facility' },
        HIERARCHY_ID,
      ),
    ).to.eventually.deep.equal({
      aggregations: [{ type: 'SUM_MOST_RECENT_PER_FACILITY', config: undefined }],
      filter: {},
    });
  });

  it('should build entity aggregation options before basic aggregation options if configured', async () => {
    return expect(
      buildAggregationOptions(
        BASIC_AGGREGATION_OPTIONS,
        BASIC_DATA_SOURCE_ENTITIES,
        {
          ...BASIC_ENTITY_AGGREGATION_OPTIONS,
          dataSourceEntityType: 'facility',
          aggregationEntityType: 'district',
          aggregationOrder: 'BEFORE',
        },
        HIERARCHY_ID,
      ),
    ).to.eventually.deep.equal({
      aggregations: [
        {
          type: Aggregator.aggregationTypes.REPLACE_ORG_UNIT_WITH_ORG_GROUP,
          config: {
            orgUnitMap: { f1: { code: 'd9', name: 'District 9' } },
          },
        },
        { type: 'SUM_MOST_RECENT_PER_FACILITY', config: undefined },
      ],
      filter: {},
    });
  });
});
