import { Row } from '../../../types';
import { Matrix, MatrixParams } from './types';

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
    const { prefixColumns, nonColumnKeys } = this.params.columns;
    const columns = prefixColumns.length > 0 ? new Set(prefixColumns) : new Set();
    this.rows.forEach(row => {
      Object.keys(row).forEach(key => {
        if (!nonColumnKeys.includes(key)) {
          columns.add(key);
        }
      });
    });
    const columnsInArray = Array.from(columns);
    this.assertIsString(columnsInArray);
    this.matrixData.columns = columnsInArray.map(c => ({ key: c, title: c }));
    return this;
  }

  buildBaseRows() {
    const categories = new Set();
    const baseRows: Row[] = [];

    const { rowTitle: rowTitleIndex, category: categoryIndex } = this.params.rows;

    this.rows.forEach(row => {
      const { [categoryIndex]: categoryId, [rowTitleIndex]: dataElement, ...restOfRow } = row;
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
