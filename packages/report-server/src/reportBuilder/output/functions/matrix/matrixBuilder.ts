import pick from 'lodash.pick';
import { Row } from '../../../types';
import { MatrixParams, Matrix } from './types';

/** TODO: currently we are using 'dataElement' as a key in rows to specify row field (name),
 * eventually we want to change Tupaia front end logic to use 'rowField' instead of 'dataElement'
 */
const ROW_FIELD = 'dataElement';
const CATEGORY_FIELD = 'categoryId';
const NON_COLUMNS_KEYS = [CATEGORY_FIELD, ROW_FIELD];

export class MatrixBuilder {
  private rows: Row[];

  private matrixData: Matrix;

  private params: MatrixParams;

  constructor(rows: Row[], params: MatrixParams) {
    this.rows = rows;
    this.params = params;
    this.matrixData = { columns: [], rows: [] };
  }

  public build() {
    this.buildColumns();
    this.buildRows();
    this.modifyRowsByPrefixColumns();
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

    const { prefixColumns, nonColumnKeys } = this.params.columns;
    if (Array.isArray(prefixColumns)) {
      assignColumnSetToMatrixData(prefixColumns);
      return;
    }
    // When prefixColumns === '*', get columns from rows data
    const columns = new Set<string>();
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

  private buildRows() {
    const rows: Row[] = [];
    const { rowField, categoryField } = this.params.rows;

    this.rows.forEach(row => {
      const { [categoryField]: categoryId, [rowField]: rowFieldData, ...restOfRow } = row;
      const newRows: Row = { [ROW_FIELD]: rowFieldData, ...restOfRow };
      if (categoryId) {
        newRows[CATEGORY_FIELD] = categoryId;
      }
      rows.push(newRows);
    });

    this.matrixData.rows = rows;
  }

  private modifyRowsByPrefixColumns() {
    const { prefixColumns } = this.params.columns;
    const newRows: Row[] = [];
    if (prefixColumns === '*') return;
    this.matrixData.rows.forEach(row => {
      const columnsDataFields = pick(row, prefixColumns);
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
