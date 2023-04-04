/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { ReportServerAggregator } from '../../../../aggregator';
import { TransformTable } from '../../../transform';
import { RawDataExport } from './types';

export class RawDataExportBuilder {
  private table: TransformTable;
  private matrixData: RawDataExport;
  private params: unknown;
  private aggregator: ReportServerAggregator;

  public constructor(table: TransformTable, params: unknown, aggregator: ReportServerAggregator) {
    this.table = table;
    this.params = params;
    this.aggregator = aggregator;
    this.matrixData = { columns: [], rows: [] };
  }

  public async build() {
    this.matrixData.columns = this.buildColumns();
    this.matrixData.rows = this.table.getRows();
    return this.matrixData;
  }

  private buildColumns() {
    return this.table.getColumns().map(columnName => ({ key: columnName, title: columnName }));
  }
}
