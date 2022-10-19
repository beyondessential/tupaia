/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { TransformTable } from '../table';
import { Row } from '../../types';

/**
 * Inserts a new column with a value that is the calculation of the percentage of 1s out of 1s and 0s in a row.
 * [{ rowFieldName: 'Availability of Male Condoms', facilityNameA: 'N', facilityNameB: 'N', facilityNameC: 'Y', facilityNameD: 'N'  },
 * { rowFieldName: 'Availability of Female Condoms', facilityNameA: 'N', facilityNameB: 'Y', facilityNameC: 'Y', facilityNameD: 'N'  }]
 *  => [{ rowFieldName: 'Availability of Male Condoms', facilityNameA: 'N', facilityNameB: 'N', facilityNameC: 'Y', facilityNameD: 'N', summaryColumn: '75%'  },
 * { rowFieldName: 'Availability of Female Condoms', facilityNameA: 'N', facilityNameB: 'Y', facilityNameC: 'Y', facilityNameD: 'N', summaryColumn: '50%'  },
 * { facilityNameA: '100%', facilityNameB: '50%', facilityNameC: '0%', facilityNameD: '100%'  }]
 */

const detectColumnsToSummarise = (table: TransformTable) => {
  const { columnsWithOnlyYorN: columnsToSummarise } = table.getRows().reduce(
    ({ columnsWithOnlyYorN, columnsWithOtherValues }, row) => {
      Object.entries(row).forEach(([columnName, value]) => {
        if (columnsWithOtherValues.has(columnName)) {
          /* do nothing */
        } else if (value === 'Y' || value === 'N') {
          columnsWithOnlyYorN.add(columnName);
        } else if (value === undefined) {
          /* do nothing */
        } else {
          columnsWithOnlyYorN.delete(columnName);
          columnsWithOtherValues.add(columnName);
        }
      });
      return { columnsWithOnlyYorN, columnsWithOtherValues };
    },
    { columnsWithOnlyYorN: new Set<string>(), columnsWithOtherValues: new Set<string>() },
  );

  return [...columnsToSummarise];
};

const addPercentage = (numerator: number, denominator: number) => {
  return `${((numerator / denominator) * 100).toFixed(1)}%`;
};

const getSummaryColumn = (table: TransformTable, columnsToSummarise: string[]) => {
  return table.getRows().map(row => {
    const numerator = Object.entries(row).filter(
      ([columnName, value]) => columnsToSummarise.includes(columnName) && value === 'N',
    ).length;
    const denominator = Object.entries(row).filter(
      ([columnName, value]) =>
        columnsToSummarise.includes(columnName) && (value === 'N' || value === 'Y'),
    ).length;
    return addPercentage(numerator, denominator);
  });
};

const getSummaryRow = (table: TransformTable, columnsToSummarise: string[]) => {
  return Object.fromEntries(
    columnsToSummarise.map((columnName: string) => {
      const { numerator, denominator } = table.getRows().reduce(
        (accumulator: Record<string, number>, row: Row) => {
          if (row[columnName] === 'N') {
            accumulator.numerator += 1;
            accumulator.denominator += 1;
          } else if (row[columnName] === 'Y') {
            accumulator.denominator += 1;
          }
          return accumulator;
        },
        { numerator: 0, denominator: 0 },
      );
      return [columnName, addPercentage(numerator, denominator)];
    }),
  );
};

export const insertSummaryRowAndColumn = () => (table: TransformTable) => {
  const columnsToSummarise = detectColumnsToSummarise(table);
  const summaryColumn = getSummaryColumn(table, columnsToSummarise);
  const summaryRow = getSummaryRow(table, columnsToSummarise);
  return table
    .upsertColumns([{ columnName: 'summaryColumn', values: summaryColumn }])
    .insertRows([{ row: summaryRow }]);
};
