import { ReportServerAggregator } from '../../../../aggregator';
import { TransformTable } from '../../../transform';
import { RawDataExport } from './types';

export class RawDataExportBuilder {
  private table: TransformTable;
  private matrixData: RawDataExport;
  // @ts-ignore
  private params: unknown;
  // @ts-ignore
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
