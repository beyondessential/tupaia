/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { ReportServerAggregator } from '../../../../aggregator';
import { Row } from '../../../types';
import { RawDataExportContext, RawDataExport } from './types';

export class RawDataExportBuilder {
  private rows: Row[];
  private matrixData: RawDataExport;
  private params: unknown;
  private outputContext: RawDataExportContext;
  private aggregator: ReportServerAggregator;

  public constructor(
    rows: Row[],
    params: unknown,
    outputContext: RawDataExportContext,
    aggregator: ReportServerAggregator,
  ) {
    this.rows = rows;
    this.params = params;
    this.outputContext = outputContext;
    this.aggregator = aggregator;
    this.matrixData = { columns: [], rows: [] };
  }

  public async build() {
    this.matrixData.columns = this.buildColumns();
    this.matrixData.rows = this.rows;
    await this.attachAllDataElementsToColumns();
    return this.matrixData;
  }

  private buildColumns() {
    const columns = new Set<string>();
    this.rows.forEach(row => {
      Object.keys(row).forEach(key => {
        columns.add(key);
      });
    });
    const allFields = Array.from(columns);

    return allFields.map(c => ({ key: c, title: c }));
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
