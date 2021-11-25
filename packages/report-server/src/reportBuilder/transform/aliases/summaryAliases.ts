/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { Row } from '../../types';

/**
 * Inserts a new column with a value that is the calculation of the percentage of 1s out of 1s and 0s in a row.
 * [{ rowFieldName: 'Availability of Male Condoms', facilityNameA: 'N', facilityNameB: 'N', facilityNameC: 'Y', facilityNameD: 'N'  },
 * { rowFieldName: 'Availability of Female Condoms', facilityNameA: 'N', facilityNameB: 'Y', facilityNameC: 'Y', facilityNameD: 'N'  }]
 *  => [{ rowFieldName: 'Availability of Male Condoms', facilityNameA: 'N', facilityNameB: 'N', facilityNameC: 'Y', facilityNameD: 'N', summaryColumn: '75%'  },
 * { rowFieldName: 'Availability of Female Condoms', facilityNameA: 'N', facilityNameB: 'Y', facilityNameC: 'Y', facilityNameD: 'N', summaryColumn: '50%'  },
 * { facilityNameA: '100%', facilityNameB: '50%', facilityNameC: '0%', facilityNameD: '100%'  }]
 */

const detectColumnsToSummarise = (rows: Row[]) => {
  const allPossibleColumns = rows.reduce((columnsToSummarise, row) => {
    const columnsWithYorN = Object.entries(row)
      .filter(([, value]) => value === 'Y' || value === 'N')
      .map(([column]) => column);
    columnsWithYorN.forEach(column => columnsToSummarise.add(column));
    return columnsToSummarise;
  }, new Set<string>());
  const setOfColumnsToSummarise = [...allPossibleColumns].filter(column => {
    return (
      rows.filter(row => row[column] !== undefined && row[column] !== 'Y' && row[column] !== 'N')
        .length === 0
    );
  });
  return setOfColumnsToSummarise;
};

const addPercentage = (numerator: number, denominator: number) => {
  return `${((numerator / denominator) * 100).toFixed(1)}%`;
};

const addSummaryColumn = (row: Row, columnsToSummarise: string[]) => {
  const numerator = Object.entries(row).filter(
    ([key, value]) => columnsToSummarise.includes(key) && value === 'N',
  ).length;
  const denominator = Object.entries(row).filter(
    ([column, value]) => columnsToSummarise.includes(column) && (value === 'N' || value === 'Y'),
  ).length;
  const summaryColumn = addPercentage(numerator, denominator);
  const updatedRow = row;
  updatedRow.summaryColumn = summaryColumn;
  return updatedRow;
};

const getSummaryRow = (rows: Row[], columnsToSummarise: string[]) => {
  const arrayOfColumns = columnsToSummarise.map((column: string) => {
    const { numerator, denominator } = rows.reduce(
      (accumulator: Record<string, number>, row: Row) => {
        if (row[column] === 'N') {
          accumulator.numerator += 1;
          accumulator.denominator += 1;
        } else if (row[column] === 'Y') {
          accumulator.denominator += 1;
        }
        return accumulator;
      },
      { numerator: 0, denominator: 0 },
    );
    return [column, addPercentage(numerator, denominator)];
  });
  return Object.fromEntries(arrayOfColumns);
};

export const insertSummaryRowAndColumn = () => (rows: Row[]) => {
  const columnsToSummarise = detectColumnsToSummarise(rows);
  const rowsWithSummaryColumn = rows.map(row => addSummaryColumn(row, columnsToSummarise));
  const summaryRow = getSummaryRow(rows, columnsToSummarise);
  return [...rowsWithSummaryColumn, summaryRow];
};
