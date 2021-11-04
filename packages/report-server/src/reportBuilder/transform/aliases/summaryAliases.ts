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
  const returnArray = rows.map(row => {
    const numerator = Object.entries(row).filter(([key,value]) => value === 0).length;
    const denominator = Object.entries(row).filter(([key,value]) => value === 0 || value === 1).length;
    if (denominator === 0) {
      return { 'summaryColumn': null, ...row };
    }
    const summary = numerator / denominator;
    return { 'summaryColumn': summary, ...row };
  });

  const summaryRow = rows.reduce((accum: Row, currentRow: Row) => {
    const arrayOfNumeratorEntries = Object.entries(currentRow).map(([key,value]) => {
      if (value === 0) {
        return [key,1]
      }
      return [key,0]
    });

    const arrayOfDenominatorEntries = Object.entries(currentRow).map(([key,value]) => {
      if (value === 0 || value === 1) {
        return [key,1]
      }
      return [key,0]
    });

    arrayOfNumeratorEntries.forEach(([key, value], index) => {
      const percentage = value / arrayOfDenominatorEntries[index][1]
      if (typeof value === 'number' && typeof accum[key] !== 'number') {
        accum[key] = 0;
        accum[key] = accum[key] + percentage;
      } else {
        accum[key] = accum[key] + percentage;
      }
    });

    return accum
  });

  return [...returnArray,summaryRow]

};

