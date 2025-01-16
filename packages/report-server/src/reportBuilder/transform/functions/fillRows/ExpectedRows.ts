/* eslint-disable no-param-reassign */
import { FieldValue } from '../../../types';

/**
 * Helper class for determining the expected rows to build based on what columns need filling
 *
 * Written a bit more verbosely to avoid using recursion for performance reasons
 */
export class ExpectedRows {
  private readonly columnNames: string[];
  private readonly columnValues: Record<string, FieldValue[]>;

  private currentRowIndex: number;
  private readonly totalRows: number;

  private readonly ticker: number[]; // Tracks which permutation of column values we're up to
  private readonly tickerBases: number[]; // Tracks the number of values per column

  public constructor(
    requiredColumnValues: {
      column: string;
      values: FieldValue[];
    }[],
  ) {
    this.columnValues = Object.fromEntries(
      requiredColumnValues.map(({ column, values }) => [column, values]),
    );
    this.columnNames = requiredColumnValues.map(({ column }) => column);

    this.ticker = new Array(this.columnNames.length).fill(0);
    this.tickerBases = this.columnNames.map(column => this.columnValues[column].length);

    this.currentRowIndex = 0;
    this.totalRows = this.tickerBases.reduce((prev, curr) => prev * curr);

    if (this.totalRows < 1) {
      throw new Error('Must provide non empty column values');
    }
  }

  /**
   * The ticker tracks which permutation we're up to.
   *
   * It's easiest to think of it as a number, but where each digit in the number has a unique base.
   * To iterate the ticker, we add 1 to the final digit, and if it overflows its base, it resets to 0 and adds one to the next digit.
   * eg.
   *    For a ticker with bases: [3, 2], the iteration would be:
   *      00, 01, 10, 11, 20, 21, done!
   */
  private updateTicker() {
    // Starting from the final digit in the ticker, add one and if we've overflowed the length of that column
    this.ticker[this.ticker.length - 1] += 1;
    for (let i = this.ticker.length - 1; i > 0; i--) {
      if (this.ticker[i] >= this.tickerBases[i]) {
        // We've completed every permutation for this digit, reset to 0 and add 1 to the next digit
        this.ticker[i] = 0;
        this.ticker[i - 1] += 1;
      } else {
        // There's still iteration left in this digit, so exit the loop
        break;
      }
    }
  }

  private getCurrentRow() {
    const row = Object.fromEntries(
      this.columnNames.map((column, index) => [
        column,
        this.columnValues[column][this.ticker[index]],
      ]),
    );

    return row;
  }

  public hasNext() {
    return this.currentRowIndex < this.totalRows;
  }

  public next() {
    const row = this.getCurrentRow();

    this.currentRowIndex += 1;
    this.updateTicker();

    return row;
  }
}
