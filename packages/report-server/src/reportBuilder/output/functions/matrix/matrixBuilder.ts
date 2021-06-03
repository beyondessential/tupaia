import { Matrix, Row } from '../../../types';
import { MatrixParams } from './types';

export class MatrixBuilder {
  rows: Row[];

  matrixData: Matrix;

  params: MatrixParams;

  constructor(rows: Row[], params: MatrixParams) {
    this.rows = rows;
    this.params = params;
    this.matrixData = { columns: [], rows: [] };
  }

  assertIsString(values: unknown[]): asserts values is string[] {
    values.forEach(value => {
      if (typeof value !== 'string') {
        throw new Error(`Expect value to be string, but got ${value}`);
      }
    });
  }

  buildBaseColumns() {
    const assignColumnSetToMatrixData = (columns: unknown[]) => {
      this.assertIsString(columns);
      this.matrixData.columns = columns.map(c => ({ key: c, title: c }));
    };

    const { prefixColumns, nonColumnKeys } = this.params.columns;
    if (Array.isArray(prefixColumns)) {
      assignColumnSetToMatrixData(prefixColumns);
      return this;
    }
    // When prefixColumns === '*', get columns from rows data
    const columns = new Set();
    this.rows.forEach(row => {
      Object.keys(row).forEach(key => {
        if (!nonColumnKeys.includes(key)) {
          columns.add(key);
        }
      });
    });
    const columnsInArray = Array.from(columns);
    assignColumnSetToMatrixData(columnsInArray);
    return this;
  }

  buildBaseRows() {
    const categories = new Set();
    const baseRows: Row[] = [];

    const { rowField, categoryField } = this.params.rows;

    this.rows.forEach(row => {
      const { [categoryField]: categoryId, [rowField]: dataElement, ...restOfRow } = row;
      categories.add(categoryId);
      baseRows.push({ categoryId, dataElement, ...restOfRow });
    });
    const categoriesInArray = Array.from(categories);
    this.assertIsString(categoriesInArray);
    const formattedCategories: Row[] = categoriesInArray.map(category => ({ category }));
    baseRows.push(...formattedCategories);
    this.matrixData.rows = baseRows;
    return this;
  }

  getMatrixData() {
    return this.matrixData;
  }
}
