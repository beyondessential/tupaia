/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { FieldValue, Row } from '../../types';

/**
 * Data structure for managing tabular data during report building process.
 *
 * Designed to be immutable, so that operations on the table return a new copy of the table
 * with the operations applied (rather than mutating the original table)
 *
 * Operations on table are all bulk operations for efficiency reasons
 */
export class TransformTable {
  private readonly columns: string[];
  private readonly rows: Row[];

  public constructor(columns: string[] = [], rows: Row[] = []) {
    this.columns = columns;
    this.rows = rows;
  }

  /**
   * Convenience constructor. Often we find ourselves wanting to convert an array of objects
   * into a TransformTable
   */
  public static fromRows(rowObjects: Row[], columnOrder?: string[]) {
    const columnsInRows = columnOrder || Array.from(new Set(rowObjects.map(Object.keys).flat()));
    return new TransformTable(columnsInRows, rowObjects);
  }

  public getColumns() {
    return [...this.columns]; // Spread to protect a caller mutating the original array
  }

  public getRows() {
    return this.rows.map(row => ({ ...row })); // Spread to protect a caller mutating the original array
  }

  public length() {
    return this.rows.length;
  }

  public width() {
    return this.columns.length;
  }

  public indexOfColumn(columnName: string) {
    return this.columns.indexOf(columnName);
  }

  public hasColumn(columnName: string) {
    return this.indexOfColumn(columnName) > -1;
  }

  public hasIndex(index: number) {
    return index > -1 && index < this.length();
  }

  public getColumnValues(columnName: string) {
    if (!this.hasColumn(columnName)) {
      throw new Error(
        `Cannot get values for column name: ${columnName}, it does not exist in the table`,
      );
    }

    return this.rows.map(row => row[columnName]);
  }

  /**
   *
   * @returns A new TransformTable with the rows inserted
   */
  public insertRows(inserts: { row: Row; index?: number }[]) {
    if (inserts.length === 0) {
      return this;
    }

    const newTable = this.clone();
    inserts.forEach(({ row, index = newTable.length() }) => {
      if (index !== newTable.length() && !newTable.hasIndex(index)) {
        throw new Error(
          `Error inserting row, index must be within 0:${newTable.length()}, but was ${index}`,
        );
      }

      const newRowWithExistingColumns: Row = {};
      const newRowWithNewColumns: Row = {};
      Object.entries(row).forEach(([columnName, value]) => {
        if (newTable.hasColumn(columnName)) {
          newRowWithExistingColumns[columnName] = value;
        } else {
          newRowWithNewColumns[columnName] = value;
        }
      });

      // STEP 1: Insert a row with values for all existing columns
      newTable.rows.splice(index, 0, newRowWithExistingColumns);

      // STEP 2: Insert a column for each new column being created in this row
      Object.entries(newRowWithNewColumns).forEach(([columnName, value]) => {
        // Create a new column with all values being undefined except the new row value
        const newColumnWithExistingRows = new Array(newTable.length())
          .fill(0)
          .map((_, rowIndex) => (rowIndex === index ? value : undefined));
        newTable.writeColumnToTable(columnName, newColumnWithExistingRows);
      });
    });

    return newTable;
  }

  /**
   *
   * @returns A new TransformTable with the columns upserted
   */
  public upsertColumns(upserts: { columnName: string; values: FieldValue[] }[]) {
    if (upserts.length === 0) {
      return this;
    }

    const newTable = this.clone();
    upserts.forEach(({ columnName, values }) => newTable.writeColumnToTable(columnName, values));

    return newTable;
  }

  /**
   * Upserts the column to the table. Mutates the existing table. For internal use only
   * @param columnName to edit/create
   * @param values column values
   */
  private writeColumnToTable(columnName: string, values: FieldValue[]) {
    if (values.length !== this.length()) {
      throw new Error(
        `Error upserting column, incorrect column length (required: ${this.length()}, but got: ${
          values.length
        }`,
      );
    }

    const isExistingColumn = this.hasColumn(columnName);
    if (!isExistingColumn) {
      this.columns.push(columnName);
    }

    values.forEach((value, index) => {
      if (isExistingColumn) {
        delete this.rows[index][columnName];
      }
      if (value !== undefined) {
        this.rows[index][columnName] = value;
      }
    });
  }

  /**
   * @returns A new TransformTable with the columns dropped
   */
  public dropColumns(columnNames: string[]) {
    if (columnNames.length === 0) {
      return this;
    }

    const newTable = this.clone();
    columnNames.forEach(columnName => {
      if (!newTable.hasColumn(columnName)) {
        // Column does not exist, so do nothing
        return;
      }

      const indexOfColumn = newTable.indexOfColumn(columnName);
      newTable.columns.splice(indexOfColumn, 1);
      newTable.rows.forEach(row => {
        // eslint-disable-next-line no-param-reassign
        delete row[columnName];
      });
    });

    return newTable;
  }

  /**
   * @param indexes indexes to drop
   * @returns A new TransformTable with the rows dropped
   */
  public dropRows(indexes: number[]) {
    if (indexes.length === 0) {
      return this;
    }

    const newTable = this.clone();
    const sortDescending = (num1: number, num2: number) => num2 - num1;
    [...indexes].sort(sortDescending).forEach(index => {
      if (!newTable.hasIndex(index)) {
        // Row does not exist, so do nothing
        return;
      }

      newTable.rows.splice(index, 1);
    });
    return newTable;
  }

  private clone() {
    return new TransformTable(
      [...this.columns],
      this.rows.map(row => ({ ...row })),
    );
  }
}
