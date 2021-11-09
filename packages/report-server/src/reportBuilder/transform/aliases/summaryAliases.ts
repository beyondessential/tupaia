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
export const insertSummaryRowAndColumn = () => (rows: Row[]) => {
  const dataWithSummaryColumn = rows.map(row => {
    const numerator = Object.entries(row).filter(([key,value]) => value === 0).length;
    const denominator = Object.entries(row).filter(([key,value]) => value === 0 || value === 1).length;
    if (denominator === 0) {
      return { 'summaryColumn': null, ...row };
    }
    const summary = numerator / denominator;
    return { 'summaryColumn': summary, ...row };
  });

  const numeratorRow = rows.reduce((accum: Row, currentRow: Row) => {
    const rowKeyValueArray = Object.entries(currentRow)
    let futureValue = {...accum}
    rowKeyValueArray.forEach(([key,value]) => {
      if (value === 0) {
        if (typeof futureValue[key] === 'number') {
          futureValue[key] = futureValue[key] + 1;
        } else {
          futureValue[key] = 1;
        }
      } else if (value === 1){
        if (typeof futureValue[key] === 'number') {
          futureValue[key] = futureValue[key] + 0;
        } else {
          futureValue[key] = 0;
        }
      }
    })
    return futureValue
  },{});

  const denominatorRow = rows.reduce((accum: Row, currentRow: Row) => {
    const rowKeyValueArray = Object.entries(currentRow)
    let futureValue = {...accum}
    
    rowKeyValueArray.forEach(([key,value]) => {
      if (value === 0 || value === 1) {
        if (typeof futureValue[key] === 'number') {
          futureValue[key] = futureValue[key] + 1;
        } else {
          futureValue[key] = 1;
        }
      }
    })
    console.log('returned denominator',JSON.stringify(futureValue))
    return futureValue
  },{});

  const summaryRow = Object.fromEntries(Object.entries(denominatorRow).map(([key,value]) => {
    if (typeof value === 'number') {
      const percentage = numeratorRow[key] / value;
    return [key, percentage]
    }
    return [key, value]
  }));


  return [...dataWithSummaryColumn,summaryRow]

};

