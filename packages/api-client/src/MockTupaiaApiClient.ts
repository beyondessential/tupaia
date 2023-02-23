/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import {
  AuthApiInterface,
  CentralApiInterface,
  DataTableApiInterface,
  EntityApiInterface,
  ReportApiInterface,
} from './connections';

import {
  MockAuthApi,
  MockCentralApi,
  MockDataTableApi,
  MockEntityApi,
  MockReportApi,
} from './connections/mocks';

export class MockTupaiaApiClient {
  public readonly auth: AuthApiInterface;
  public readonly central: CentralApiInterface;
  public readonly dataTable: DataTableApiInterface;
  public readonly entity: EntityApiInterface;
  public readonly report: ReportApiInterface;

  public constructor({
    auth = new MockAuthApi(),
    central = new MockCentralApi(),
    dataTable = new MockDataTableApi(),
    entity = new MockEntityApi(),
    report = new MockReportApi(),
  } = {}) {
    this.auth = auth;
    this.central = central;
    this.dataTable = dataTable;
    this.entity = entity;
    this.report = report;
  }
}
