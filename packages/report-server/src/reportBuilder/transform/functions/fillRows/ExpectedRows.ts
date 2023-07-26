/* eslint-disable no-param-reassign */
/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { FieldValue } from '../../../types';

/**
 * Helper class for determining the expected rows to build based on what columns need filling
 *
 * Written a bit more verbosely to avoid using recursion for performance reasons
 */
export class ExpectedRows {
  private count: number;
  private readonly columns: string[];
  private readonly valuesByColumn: Record<string, FieldValue[]>;
  private readonly maxCount: number;
  private readonly counts: number[];
  private readonly maxCounts: number[];

  public constructor(
    requiredColumnValues: {
      column: string;
      values: FieldValue[];
    }[],
  ) {
    this.valuesByColumn = Object.fromEntries(
      requiredColumnValues.map(({ column, values }) => [column, values]),
    );

    this.columns = requiredColumnValues.map(({ column }) => column);
    this.count = 0;
    this.counts = new Array(this.columns.length).fill(0);
    this.maxCounts = this.columns.map(column => this.valuesByColumn[column].length);
    this.maxCount = this.maxCounts.reduce((prev, curr) => prev * curr);

    if (this.maxCount < 1) {
      throw new Error('Must provide non empty column values');
    }
  }

  public hasNext() {
    return this.count < this.maxCount;
  }

  public next() {
    // Get current row
    const row = Object.fromEntries(
      this.columns.map((column, index) => [
        column,
        this.valuesByColumn[column][this.counts[index]],
      ]),
    );

    // Update the counts to next
    this.count += 1;
    this.counts[this.counts.length - 1] += 1;
    for (let i = this.counts.length - 1; i > 0; i--) {
      if (this.counts[i] >= this.maxCounts[i]) {
        this.counts[i] = 0;
        this.counts[i - 1] += 1;
      } else {
        break;
      }
    }

    return row;
  }
}
