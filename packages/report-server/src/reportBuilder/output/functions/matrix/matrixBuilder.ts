import { Row } from '../../../types';
import { MatrixParams, Matrix } from './types';

function assertIsString(values: unknown[]): asserts values is string[] {
  values.forEach(value => {
    if (typeof value !== 'string') {
      throw new Error(`Expect value to be string, but got ${value}`);
    }
  });
}

export class MatrixBuilder {
  rows: Row[];

  matrixData: Matrix;

  params: MatrixParams;

  constructor(rows: Row[], params: MatrixParams) {
    this.rows = rows;
    this.params = params;
    this.matrixData = { columns: [], rows: [] };
  }

  build() {
    this.buildColumns();
    this.buildRows();
    return this.matrixData;
  }

  buildColumns() {
    const assignColumnSetToMatrixData = (columns: unknown[]) => {
      assertIsString(columns);
      this.matrixData.columns = columns.map(c => ({ key: c, title: c }));
    };

    const { prefixColumns, nonColumnKeys } = this.params.columns;
    if (Array.isArray(prefixColumns)) {
      assignColumnSetToMatrixData(prefixColumns);
      return;
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
  }

  buildRows() {
    const categories = new Set();
    const rows: Row[] = [];

    const { rowField, categoryField } = this.params.rows;

    this.rows.forEach(row => {
      const { [categoryField]: categoryId, [rowField]: dataElement, ...restOfRow } = row;
      const newRows: Row = { dataElement, ...restOfRow };
      if (categoryId) {
        newRows.categoryId = categoryId;
        categories.add(categoryId);
      }
      rows.push(newRows);
    });

    if (categories.size > 0) {
      const categoriesInArray = Array.from(categories);
      assertIsString(categoriesInArray);
      const formattedCategories: Row[] = categoriesInArray.map(category => ({ category }));
      rows.push(...formattedCategories);
    }
    this.matrixData.rows = rows;
  }
}
