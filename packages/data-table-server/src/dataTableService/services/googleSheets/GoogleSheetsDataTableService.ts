/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { requireEnv, yup } from '@tupaia/utils';
import { google } from 'googleapis';
import { DataTableService } from '../../DataTableService';
import { buildDefaultGoogleSheetColumns } from './buildDefaultGoogleSheetColumns';

const configSchema = yup.object().shape({
  spreadsheetId: yup.string().required(),
  sheetName: yup.string().required(),
  hasHeaderRow: yup.boolean().default(false),
});

type GoogleSheetsDataTableContext = Record<string, unknown>;

export class GoogleSheetsDataTableService extends DataTableService<
  GoogleSheetsDataTableContext,
  yup.AnyObjectSchema,
  typeof configSchema,
  Record<string, unknown>
> {
  protected supportsAdditionalParams = false;

  public constructor(context: GoogleSheetsDataTableContext, config: unknown) {
    super(context, yup.object(), configSchema, config);
  }

  private async fetchSheetData() {
    const { spreadsheetId, sheetName } = this.config;
    const apiKey = requireEnv('GOOGLE_API_KEY');
    const service = google.sheets({ version: 'v4', auth: apiKey });
    const result = await service.spreadsheets.values.get({
      spreadsheetId,
      range: sheetName,
    });
    return result.data.values || ([] as unknown[][]);
  }

  private determineColumns(rows: unknown[][]) {
    const { hasHeaderRow, sheetName } = this.config;
    let columns: string[];
    if (hasHeaderRow) {
      const headerRow = rows.shift();
      if (!headerRow) {
        throw new Error(`Header row missing in sheet: ${sheetName}`);
      }
      columns = headerRow.map(column => `${column}`);
    } else {
      columns = buildDefaultGoogleSheetColumns(rows);
    }
    return columns;
  }

  private formatRowsByColumns(rows: unknown[][], columns: string[]) {
    const formattedRows: Record<string, unknown>[] = [];
    rows.forEach(row => {
      const formattedRow: Record<string, unknown> = {};
      columns.forEach((column, index) => {
        const columnValue = row[index];
        // Google sheets uses empty string to signify an empty cell
        if (columnValue !== '') {
          formattedRow[column] = columnValue;
        }
      });
      formattedRows.push(formattedRow);
    });
    return formattedRows;
  }

  protected async pullData() {
    const rows = await this.fetchSheetData();
    const columns = this.determineColumns(rows);
    const formattedRows = this.formatRowsByColumns(rows, columns);
    return formattedRows;
  }
}
