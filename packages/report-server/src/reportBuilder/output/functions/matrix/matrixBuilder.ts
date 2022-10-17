import pick from 'lodash.pick';
import { TransformTable } from '../../../transform';

import { Row } from '../../../types';
import { MatrixParams, Matrix } from './types';

/** TODO: currently we are using 'dataElement' as a key in rows to specify row field (name),
 * eventually we want to change Tupaia front end logic to use 'rowField' instead of 'dataElement'
 */
const ROW_FIELD_KEY = 'dataElement';
const CATEGORY_FIELD_KEY = 'categoryId';
const NON_COLUMNS_KEYS = [CATEGORY_FIELD_KEY, ROW_FIELD_KEY];

export class MatrixBuilder {
  private table: TransformTable;
  private matrixData: Matrix;
  private params: MatrixParams;

  public constructor(table: TransformTable, params: MatrixParams) {
    this.table = table;
    this.params = params;
    this.matrixData = { columns: [], rows: [] };
  }

  public build() {
    this.buildColumns();
    this.buildRows();
    this.adjustRowsToUseIncludedColumns();
    this.buildCategories();
    return this.matrixData;
  }

  private buildColumns() {
    /** TODO: currently we are using columns data formatted as
     *                  '[ { key: ${columnName}, title: ${columnName} } ]',
     * eventually we want to refactor Tupaia frontend logic to render columns with an array formatted as
     *                  '[ ${columnName} ]'
     */
    const assignColumnSetToMatrixData = (columns: string[]) => {
      this.matrixData.columns = columns.map(c => ({ key: c, title: c }));
    };

    const getRemainingFieldsFromRows = (includeFields: string[], excludeFields: string[]) => {
      return this.table
        .getColumns()
        .filter(
          columnName => !excludeFields.includes(columnName) && !includeFields.includes(columnName),
        );
    };

    const { includeFields, excludeFields } = this.params.columns;

    const remainingFields = includeFields.includes('*')
      ? getRemainingFieldsFromRows(includeFields, excludeFields)
      : [];

    const allFields = includeFields.map(field => (field === '*' ? remainingFields : field)).flat();

    assignColumnSetToMatrixData(allFields);
  }

  private buildRows() {
    const rows: Row[] = [];
    const { rowField, categoryField } = this.params.rows;

    this.table.getRows().forEach(row => {
      let newRows: Row;
      if (categoryField) {
        const { [rowField]: rowFieldData, [categoryField]: categoryId, ...restOfRow } = row;
        newRows = { [ROW_FIELD_KEY]: rowFieldData, [CATEGORY_FIELD_KEY]: categoryId, ...restOfRow };
      } else {
        const { [rowField]: rowFieldData, ...restOfRow } = row;
        newRows = { [ROW_FIELD_KEY]: rowFieldData, ...restOfRow };
      }
      rows.push(newRows);
    });

    this.matrixData.rows = rows;
  }

  private adjustRowsToUseIncludedColumns() {
    const { includeFields } = this.params.columns;
    const newRows: Row[] = [];

    if (includeFields.includes('*')) {
      // All fields are in the matrix, so no need to filter down rows
      return;
    }

    this.matrixData.rows.forEach(row => {
      const columnsDataFields = pick(row, includeFields);
      if (Object.keys(columnsDataFields).length !== 0) {
        const otherFields = pick(row, NON_COLUMNS_KEYS);
        newRows.push({ ...otherFields, ...columnsDataFields });
      }
    });

    this.matrixData.rows = newRows;
  }

  private buildCategories() {
    const categories = new Set<string>();
    const newRows: Row[] = [...this.matrixData.rows];

    this.matrixData.rows.forEach(row => {
      const { categoryId } = row;
      if (categoryId && typeof categoryId === 'string') {
        categories.add(categoryId);
      }
    });
    if (categories.size > 0) {
      const categoriesInArray = Array.from(categories);
      const formattedCategories: Row[] = categoriesInArray.map(category => ({ category }));
      newRows.push(...formattedCategories);
    }

    this.matrixData.rows = newRows;
  }
}
