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

const detectColumnsToSummarise = (rows: Row[]): string[] => {
  console.log(rows)
  const anyRelevantColumns = rows.reduce((previousValue, currentValue) => {
    const columnsWithYorN = Object.entries(currentValue).filter(([,value]) => value === 'Y' || value === 'N').map(([column,]) => column);
    return previousValue.concat(columnsWithYorN);
  },[] as string[])
  const columnsToSummarise = anyRelevantColumns.reduce((previousValue: string[], currentValue: string): string[] => {
    if (previousValue.indexOf(currentValue) > -1) {
      return previousValue
    }
    previousValue.push(currentValue)
    return previousValue
  },[] as string[])

  return columnsToSummarise
};

const addSummaryColumn = (row: Row, columnsToSummarise: string[]): Row => {
  const numerator = Object.entries(row).filter(([key,value]) => columnsToSummarise.indexOf(key) > -1 && value === 'N').length
  const denominator = Object.entries(row).filter(([key,]) => columnsToSummarise.indexOf(key) > -1).length
  const summaryColumn = `${(numerator / denominator * 100).toFixed(1)}%`
  row.summaryColumn = summaryColumn
  return row
};

const getSummaryRow = (rows: Row[], columnsToSummarise: string[]): Record<string,string> => {
  const arrayOfColumns = columnsToSummarise.map((column: string) => {
    const [numerator, denominator] = rows.reduce((previousValue, currentValue) => {
      if (currentValue[column] === 'N') {
        previousValue[0] += 1
        previousValue[1] += 1
      } else if (currentValue[column] === 'Y') {
        previousValue[1] += 1
      }
      return previousValue
    },[0,0])
    return [column,`${(numerator / denominator * 100).toFixed(1)}%`]
  })
  return Object.fromEntries(arrayOfColumns)
};
  

export const insertSummaryRowAndColumn = () => (rows: Row[]): Row[] => {
  const columnsToSummarise: string[] = detectColumnsToSummarise(rows);
  const rowsWithSummaryColumn: Row[] = rows.map(row => addSummaryColumn(row, columnsToSummarise));
  const summaryRow: Row = getSummaryRow(rows, columnsToSummarise); 
  return [...rowsWithSummaryColumn, summaryRow];
};