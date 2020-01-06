/**
 * Tupaia Config Server
 * Copyright (c) 2020 Beyond Essential Systems Pty Ltd
 */

const TOTAL_KEYS = {
  total: '$total',
  rowTotal: '$rowTotal',
  columnTotal: '$columnTotal',
  rowCategoryColumnTotal: '$rowCategoryColumnTotal',
  columnCategoryRowTotal: '$columnCategoryRowTotal',
};
const TOTAL_KEY_LIST = Object.values(TOTAL_KEYS);

export class TotalCalculator {
  rowCatLimitsByRowIndex = null;

  columnCatLimitsByColumnIndex = null;

  constructor(tableConfig, valuesByCell) {
    this.tableConfig = tableConfig;
    this.valuesByCell = valuesByCell;

    if (this.tableConfig.hasRowCategories()) {
      this.rowCatLimitsByRowIndex = this.generateCategoryLimitsByIndex('rows');
    }
    if (this.tableConfig.hasColumnCategories()) {
      this.columnCatLimitsByColumnIndex = this.generateCategoryLimitsByIndex('columns');
    }
  }

  generateCategoryLimitsByIndex(dimension) {
    const limitsByIndex = [];

    let start = 0;
    let end = -1;
    let index = 0;
    this.tableConfig[dimension].forEach(({ [dimension]: lines }) => {
      start = end + 1;
      end = start + lines.length - 1;

      lines.forEach(() => {
        limitsByIndex[index] = [start, end];
        index++;
      });
    });

    return limitsByIndex;
  }

  static isTotalKey = key => TOTAL_KEY_LIST.includes(key);

  calculate(rowIndex, columnIndex) {
    const totalKey = this.tableConfig.cells[rowIndex][columnIndex];

    switch (totalKey) {
      case TOTAL_KEYS.total:
        return this.calculateTotal();
      case TOTAL_KEYS.rowTotal:
        return this.calculateRowTotal(rowIndex);
      case TOTAL_KEYS.columnTotal:
        return this.calculateColumnTotal(columnIndex);
      case TOTAL_KEYS.rowCategoryColumnTotal:
        return this.calculateRowCategoryColumnTotal(rowIndex, columnIndex);
      case TOTAL_KEYS.columnCategoryRowTotal:
        return this.calculateColumnCategoryRowTotal(rowIndex, columnIndex);
      default: {
        throw new Error(`Invalid total key ${totalKey}`);
      }
    }
  }

  calculateTotal() {
    const endColumn = Math.max(...this.tableConfig.cells.map(cellRow => cellRow.length - 1));
    return this.addValues(0, this.tableConfig.cells.length - 1, 0, endColumn);
  }

  calculateRowTotal(rowIndex) {
    return this.addValues(rowIndex, rowIndex, 0, this.tableConfig.cells[rowIndex].length - 1);
  }

  calculateColumnTotal(columnIndex) {
    return this.addValues(0, this.tableConfig.cells.length - 1, columnIndex, columnIndex);
  }

  calculateRowCategoryColumnTotal(rowIndex, columnIndex) {
    if (!this.tableConfig.hasRowCategories()) {
      throw new Error('Cannot calculate row category totals if row categories are not defined');
    }

    const [startRow, endRow] = this.rowCatLimitsByRowIndex[rowIndex];
    return this.addValues(startRow, endRow, columnIndex, columnIndex);
  }

  calculateColumnCategoryRowTotal(rowIndex, columnIndex) {
    if (!this.tableConfig.hasColumnCategories()) {
      throw new Error(
        'Cannot calculate column category totals if column categories are not defined',
      );
    }

    const [startColumn, endColumn] = this.columnCatLimitsByColumnIndex[columnIndex];
    return this.addValues(rowIndex, rowIndex, startColumn, endColumn);
  }

  addValues(startRow, endRow, startColumn, endColumn) {
    let total = 0;
    for (let row = startRow; row <= endRow; row++) {
      for (let column = startColumn; column <= endColumn; column++) {
        const cell = this.tableConfig.cells[row][column];
        total += cell && !TotalCalculator.isTotalKey(cell) ? this.valuesByCell[cell] : 0;
      }
    }

    return total;
  }
}
