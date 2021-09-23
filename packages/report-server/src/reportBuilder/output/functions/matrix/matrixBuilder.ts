import pick from 'lodash.pick';
import { Row, PeriodMetadata } from '../../../types';
import { Response } from '../../types';
import { MatrixParams, Matrix } from './types';

/** TODO: currently we are using 'dataElement' as a key in rows to specify row field (name),
 * eventually we want to change Tupaia front end logic to use 'rowField' instead of 'dataElement'
 */
const ROW_FIELD_KEY = 'dataElement';
const CATEGORY_FIELD_KEY = 'categoryId';
const NON_COLUMNS_KEYS = [CATEGORY_FIELD_KEY, ROW_FIELD_KEY];

export class MatrixBuilder {
  private rows: Row[];

  private metadata: PeriodMetadata;

  private matrixData: Matrix;

  private params: MatrixParams;

  constructor(response: Response, params: MatrixParams) {
    const { results, ...metadata } = response;
    this.rows = results;
    this.metadata = metadata;
    this.params = params;
    this.matrixData = { columns: [], rows: [] };
  }

  public build() {
    this.buildColumns();
    this.buildPeriod();
    this.buildRows();
    this.adjustRowsToUseIncludedColumns();
    this.buildCategories();
    return { results: this.matrixData, ...this.metadata };
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

    const { includeFields, excludeFields } = this.params.columns;
    if (Array.isArray(includeFields)) {
      assignColumnSetToMatrixData(includeFields);
      return;
    }
    // When prefixColumns === '*', get columns from rows data
    const columns = new Set<string>();
    this.rows.forEach(row => {
      Object.keys(row).forEach(key => {
        if (!excludeFields.includes(key)) {
          columns.add(key);
        }
      });
    });
    const columnsInArray = Array.from(columns);
    assignColumnSetToMatrixData(columnsInArray);
  }

  private buildPeriod() {
    const isString = (val: unknown): val is string => typeof val === 'string';
    const periods = this.rows
      .map(row => row.period)
      .filter(isString)
      .sort();

    if (periods.length > 0) {
      const earliestPeriod = periods[0];
      const latestPeriod = periods[periods.length - 1];
      this.metadata.period = {
        ...this.metadata.period,
        reportStart: earliestPeriod,
        reportEnd: latestPeriod,
      };
    }
  }

  private buildRows() {
    const rows: Row[] = [];
    const { excludeFields } = this.params.columns;
    const { rowField, categoryField } = this.params.rows;

    this.rows.forEach(row => {
      const newRow = { ...row };
      excludeFields.forEach(field => delete newRow[field]);
      if (categoryField) {
        newRow[CATEGORY_FIELD_KEY] = row[categoryField];
      }
      newRow[ROW_FIELD_KEY] = row[rowField];
      rows.push(newRow);
    });

    this.matrixData.rows = rows;
  }

  private adjustRowsToUseIncludedColumns() {
    const { includeFields } = this.params.columns;
    const newRows: Row[] = [];
    if (includeFields === '*') return;
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
