/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { ReportServerAggregator } from '../../../../aggregator';
import { TransformTable } from '../../../transform';
import { RawDataExportContext, RawDataExport } from './types';

export class RawDataExportBuilder {
  private table: TransformTable;
  private matrixData: RawDataExport;
  private params: unknown;
  private outputContext: RawDataExportContext;
  private aggregator: ReportServerAggregator;

  public constructor(
    table: TransformTable,
    params: unknown,
    outputContext: RawDataExportContext,
    aggregator: ReportServerAggregator,
  ) {
    this.table = table;
    this.params = params;
    this.outputContext = outputContext;
    this.aggregator = aggregator;
    this.matrixData = { columns: [], rows: [] };
  }

  public async build() {
    this.matrixData.columns = this.buildColumns();
    this.matrixData.rows = this.table.getRows();
    await this.attachAllDataElementsToColumns();
    return this.matrixData;
  }

  private buildColumns() {
    return this.table.getColumns().map(columnName => ({ key: columnName, title: columnName }));
  }

  private async attachAllDataElementsToColumns() {
    if (!this.outputContext.dataGroups) {
      return;
    }
    const { dataGroups } = this.outputContext;

    const dataElementsMetadata = (
      await Promise.all(
        dataGroups.map(async surveyCode => {
          const { dataElements } = await this.aggregator.fetchDataGroup(surveyCode);
          return dataElements.map(dataElement => ({
            key: dataElement.code,
            title: dataElement.text,
          }));
        }),
      )
    ).flat();
    const keysFromMetadata = dataElementsMetadata.map(({ key }) => key);
    // Entity code, Entity Name, Date or other added columns
    const restOfColumns = this.matrixData.columns.filter(
      column => !keysFromMetadata.includes(column.key),
    );
    this.matrixData.columns = [...restOfColumns, ...dataElementsMetadata];
  }
}
