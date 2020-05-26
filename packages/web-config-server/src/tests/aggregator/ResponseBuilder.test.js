/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */
import { expect } from 'chai';
import { it, describe } from 'mocha';
import sinon from 'sinon';

import { ResponseBuilder } from '/aggregator/ResponseBuilder';
import { Entity } from '/models/Entity';
import { DataAggregatingRouteHandler } from '/apiV1/DataAggregatingRouteHandler';

const analytics = {
  results: [
    { organisationUnit: 'OrgUnit1', dataElement: 'DE_1', value: 0, period: '20200101' },
    { organisationUnit: 'OrgUnit2', dataElement: 'DE_1', value: 1, period: '20200101' },
    { organisationUnit: 'OrgUnit3', dataElement: 'DE_1', value: 2, period: '20200101' },
    { organisationUnit: 'OrgUnit4', dataElement: 'DE_1', value: 3, period: '20200101' },
    { organisationUnit: 'OrgUnit5', dataElement: 'DE_1', value: 4, period: '20200101' },
  ],
  period: { key: 'val' },
  metadata: { key: 'val' },
};
const entityParentMap = {
  OrgUnit1: 'Parent1',
  OrgUnit2: 'Parent1',
  OrgUnit3: 'Parent2',
  OrgUnit4: 'Parent2',
  OrgUnit5: 'Parent3',
};

class EntityStub {
  constructor(code) {
    this.code = code;
  }

  find = ({ code: codes }) => codes.map(code => new EntityStub(code));

  getAncestorOfType = type => {
    const ancestor = type === 'baseType' ? this : new EntityStub(entityParentMap[this.code]);
    return ancestor;
  };
}

const stubEntityModel = () => {
  const findStub = sinon.stub(Entity, 'find');
  findStub.callsFake(({ code: codes }) => codes.map(code => new EntityStub(code)));
};

const stubRouteHandler = (shouldAggregate, entityAggregationType) => {
  stubEntityModel();
  const routeHandler = new DataAggregatingRouteHandler({}, {});
  routeHandler.aggregationEntityType = shouldAggregate ? 'parentType' : 'baseType';
  routeHandler.dataSourceEntityType = 'baseType';
  routeHandler.entityAggregationType = entityAggregationType;
  return routeHandler;
};

describe.only('ResponseBuilder', () => {
  afterEach(() => {
    Entity.find.restore();
  });

  it('should return results unadulterated if aggregationEntityType === dataSourceEntityType', async () => {
    const routeHandler = stubRouteHandler(false);
    const responseBuilder = new ResponseBuilder(analytics, 'analytics', routeHandler);
    const response = await responseBuilder.build();
    expect(response).to.deep.equal(analytics);
  });

  it('should use RAW if no entityAggregationType is specified', async () => {
    const expectedResponse = {
      results: [
        { organisationUnit: 'Parent1', dataElement: 'DE_1', value: 0, period: '20200101' },
        { organisationUnit: 'Parent1', dataElement: 'DE_1', value: 1, period: '20200101' },
        { organisationUnit: 'Parent2', dataElement: 'DE_1', value: 2, period: '20200101' },
        { organisationUnit: 'Parent2', dataElement: 'DE_1', value: 3, period: '20200101' },
        { organisationUnit: 'Parent3', dataElement: 'DE_1', value: 4, period: '20200101' },
      ],
      period: { key: 'val' },
      metadata: { key: 'val' },
    };

    const routeHandler = stubRouteHandler(true);
    const responseBuilder = new ResponseBuilder(analytics, 'analytics', routeHandler);
    const response = await responseBuilder.build();
    expect(response).to.deep.equal(expectedResponse);
  });

  it('should SUM correctly', async () => {
    const expectedResponse = {
      results: [
        { organisationUnit: 'Parent1', dataElement: 'DE_1', value: 1, period: '20200101' },
        { organisationUnit: 'Parent2', dataElement: 'DE_1', value: 5, period: '20200101' },
        { organisationUnit: 'Parent3', dataElement: 'DE_1', value: 4, period: '20200101' },
      ],
      period: { key: 'val' },
      metadata: { key: 'val' },
    };

    const routeHandler = stubRouteHandler(true, 'SUM');
    const responseBuilder = new ResponseBuilder(analytics, 'analytics', routeHandler);
    const response = await responseBuilder.build();
    expect(response).to.deep.equal(expectedResponse);
  });

  it('should SUM_YES correctly', async () => {
    const results = [
      { organisationUnit: 'OrgUnit1', dataElement: 'DE_1', value: 'Yes', period: '20200101' },
      { organisationUnit: 'OrgUnit2', dataElement: 'DE_1', value: 'No', period: '20200101' },
      { organisationUnit: 'OrgUnit3', dataElement: 'DE_1', value: 'Yes', period: '20200101' },
      { organisationUnit: 'OrgUnit4', dataElement: 'DE_1', value: 'Yes', period: '20200101' },
      {
        organisationUnit: 'OrgUnit5',
        dataElement: 'DE_1',
        value: 'Yes, but Expired', // Only sums exactly 'Yes' values
        period: '20200101',
      },
    ];

    const expectedResponse = {
      results: [
        { organisationUnit: 'Parent1', dataElement: 'DE_1', value: 1, period: '20200101' },
        { organisationUnit: 'Parent2', dataElement: 'DE_1', value: 2, period: '20200101' },
        { organisationUnit: 'Parent3', dataElement: 'DE_1', value: 0, period: '20200101' },
      ],
      period: { key: 'val' },
      metadata: { key: 'val' },
    };

    const routeHandler = stubRouteHandler(true, 'SUM_YES');
    const responseBuilder = new ResponseBuilder(
      { ...analytics, results },
      'analytics',
      routeHandler,
    );
    const response = await responseBuilder.build();
    expect(response).to.deep.equal(expectedResponse);
  });
});
