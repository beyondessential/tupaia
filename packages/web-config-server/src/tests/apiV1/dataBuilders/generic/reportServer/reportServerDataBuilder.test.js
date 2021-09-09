/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';
import sinon from 'sinon';

import { ReportServerBuilder } from '/apiV1/dataBuilders/generic/reportServer/reportServerDataBuilder';

const reportRequestKey = (reportCode, query = {}, body = {}) =>
  `reportCode:${reportCode},${Object.entries(query)
    .map(entry => entry.join(':'))
    .join(',')},${Object.entries(body)
    .map(entry => entry.join(':'))
    .join(',')}`;

const REPORT_SERVER_RESPONSES = {
  [reportRequestKey('1', { organisationUnitCodes: 'TO', hierarchy: 'psss' })]: {
    results: [
      { period: '2018', organisationUnit: 'TO', dataElement: 'AGGR01', value: 1 },
      { period: '2019', organisationUnit: 'TO', dataElement: 'AGGR02', value: 3 },
      { period: '2020', organisationUnit: 'TO', dataElement: 'AGGR01', value: 4 },
      { period: '2021', organisationUnit: 'TO', dataElement: 'AGGR02', value: 5 },
    ],
  },
  [reportRequestKey('1', {
    organisationUnitCodes: 'TO',
    hierarchy: 'psss',
    startDate: '2020-01-01',
    endDate: '2021-01-01',
  })]: {
    results: [
      { period: '2020', organisationUnit: 'TO', dataElement: 'AGGR01', value: 4 },
      { period: '2021', organisationUnit: 'TO', dataElement: 'AGGR02', value: 5 },
    ],
  },
  [reportRequestKey('2', {
    organisationUnitCodes: 'PG',
    hierarchy: 'strive',
    startDate: '2020-01-01',
  })]: {
    results: [
      { period: '2020', organisationUnit: 'PG', dataElement: 'PSSS01', value: 4 },
      { period: '2021', organisationUnit: 'PG', dataElement: 'PSSS02', value: 5 },
    ],
  },
};

const PROJECTS = [
  { code: 'ps', entity_hierarchy_id: '1' },
  { code: 'str', entity_hierarchy_id: '2' },
];

const ENTITY_HIERARCHIES = [
  { id: '1', name: 'psss' },
  { id: '2', name: 'strive' },
];

const req = { session: { userJson: { userName: 'test' } } };

const fetchReport = sinon.stub();
fetchReport.callsFake(
  (reportCode, query, body) => REPORT_SERVER_RESPONSES[reportRequestKey(reportCode, query, body)],
);

const findProject = sinon.stub();
findProject.callsFake(({ code }) => PROJECTS.find(project => project.code === code));

const findEntityHierarchyById = sinon.stub();
findEntityHierarchyById.callsFake(id => ENTITY_HIERARCHIES.find(hierarchy => hierarchy.id === id));

const reportConnection = { fetchReport };
const models = {
  project: { findOne: findProject },
  entityHierarchy: { findById: findEntityHierarchyById },
};

describe('ReportServerDataBuilder', () => {
  const assertBuilderResponseIsCorrect = async ({ config, query, entity }, expectedResponse) => {
    const dataBuilder = new ReportServerBuilder(req, models, config, query, entity);
    dataBuilder.reportConnection = reportConnection;
    return expect(dataBuilder.build()).to.eventually.deep.equal(expectedResponse);
  };

  it('should request correct report', () =>
    assertBuilderResponseIsCorrect(
      {
        config: { reportCode: '1' },
        query: { projectCode: 'ps' },
        entity: { code: 'TO' },
      },
      {
        data: [
          { period: '2018', organisationUnit: 'TO', dataElement: 'AGGR01', value: 1 },
          { period: '2019', organisationUnit: 'TO', dataElement: 'AGGR02', value: 3 },
          { period: '2020', organisationUnit: 'TO', dataElement: 'AGGR01', value: 4 },
          { period: '2021', organisationUnit: 'TO', dataElement: 'AGGR02', value: 5 },
        ],
      },
    ));

  it('should request for correct start/end date', () =>
    assertBuilderResponseIsCorrect(
      {
        config: { reportCode: '1' },
        query: {
          projectCode: 'ps',
          startDate: '2020-01-01',
          endDate: '2021-01-01',
        },
        entity: { code: 'TO' },
      },
      {
        data: [
          { period: '2020', organisationUnit: 'TO', dataElement: 'AGGR01', value: 4 },
          { period: '2021', organisationUnit: 'TO', dataElement: 'AGGR02', value: 5 },
        ],
      },
    ));

  it('should request for correct entity hierarchy', () =>
    assertBuilderResponseIsCorrect(
      {
        config: { reportCode: '2' },
        query: {
          projectCode: 'str',
          startDate: '2020-01-01',
        },
        entity: { code: 'PG' },
      },
      {
        data: [
          { period: '2020', organisationUnit: 'PG', dataElement: 'PSSS01', value: 4 },
          { period: '2021', organisationUnit: 'PG', dataElement: 'PSSS02', value: 5 },
        ],
      },
    ));
});
