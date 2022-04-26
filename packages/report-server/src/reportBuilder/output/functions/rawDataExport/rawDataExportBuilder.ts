/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { yup } from '@tupaia/utils';
import { ReportServerAggregator } from '../../../../aggregator';
import { Row } from '../../../types';
import { RawDataExportParams, RawDataExport } from './types';

export class RawDataExportBuilder {
  private rows: Row[];
  private matrixData: RawDataExport;
  private params: RawDataExportParams;
  private aggregator: ReportServerAggregator;

  public constructor(rows: Row[], params: RawDataExportParams, aggregator: ReportServerAggregator) {
    this.rows = rows;
    this.params = params;
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
    const dataElementValidator = yup
      .array()
      .of(
        yup.object().shape({
          code: yup.string().required(),
          text: yup.string().required(),
        }),
      )
      .required();
    if (!this.params.dataGroups) {
      return;
    }
    const { dataGroups } = this.params;

    const dataElementsMetadata = (
      await Promise.all(
        dataGroups.map(async surveyCode => {
          const { dataElements } = await this.aggregator.fetchDataGroup(surveyCode);
          const validatedDataElements = dataElementValidator.validateSync(dataElements);

          return validatedDataElements.map(dataElement => ({
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
