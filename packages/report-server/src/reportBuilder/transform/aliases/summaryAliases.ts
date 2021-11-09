/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { Row } from '../../types';

/**
 * Inserts a new column with a value that is the calculation of the percentage of 1s out of 1s and 0s in a row.
 * { rowFieldName: 'Availability of Male Condoms', facilityNameA: 'N', facilityNameB: 'N', facilityNameC: 'Y', facilityNameD: 'N'  }
 *  => { rowFieldName: 'Availability of Male Condoms', facilityNameA: 'N', facilityNameB: 'N', facilityNameC: 'Y', facilityNameD: 'N', rowSummary: 0.75 }
 */

const getRowsWithSummaryColumn = (rows: Row[]) => {
  return rows.map(row => {
    const numerator = Object.entries(row).filter(([key,value]) => value === 'N').length;
    const denominator = Object.entries(row).filter(([key,value]) => value === 'N' || value === 'Y').length;
    if (denominator === 0) {
      return { 'summaryColumn': null, ...row };
    }
    const summary = `${(numerator / denominator * 100).toFixed(1)}%`;
    return { 'summaryColumn': summary, ...row };
  })
};

const getFractionRow = (rows: Row[],isNumerator: boolean) => {
  return rows.reduce((accum: Row, currentRow: Row) => {
    const rowKeyValueArray = Object.entries(currentRow)
    let futureValue: Row = {...accum}
    rowKeyValueArray.forEach(([key,value]) => {
      let currentValue = futureValue[key] as string | undefined | number; 
      if (isNumerator) {
        if (value === 'N') {
          if (typeof currentValue === 'number') {
            currentValue = currentValue + 1;
          } else {
            currentValue = 1;
          }
        } else if (value === 'Y'){
          if (typeof currentValue === 'number') {
            currentValue = currentValue + 0;
          } else {
            currentValue = 0;
          }
        }
      } else {
        if (value === 'N' || value === 'Y') {
          if (typeof currentValue === 'number') {
            currentValue = currentValue + 1;
          } else {
            currentValue = 1;
          }
        }
      }
    })
    return futureValue
  },{})
};

const getSummaryRow = (numeratorRow: Row, denominatorRow: Row) => {
  return Object.fromEntries(Object.entries(denominatorRow).map(([key,value]) => {
    const numeratorValue = numeratorRow[key] as number;
    if (typeof value === 'number') {
      const percentage = `${(numeratorValue / value * 100).toFixed(1)}%`;
    return [key, percentage]
    }
    return [key, value]
  }))
}

export const insertSummaryRowAndColumn = () => (rows: Row[]) => {
  const rowsWithSummaryColumn = getRowsWithSummaryColumn(rows);
  const numeratorRow = getFractionRow(rows,true);
  const denominatorRow = getFractionRow(rows,false)
  const summaryRow = getSummaryRow(numeratorRow,denominatorRow)
  return [...rowsWithSummaryColumn,summaryRow]
};

