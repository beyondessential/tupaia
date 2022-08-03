/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { yup } from '@tupaia/utils';
import { Row, FieldValue } from '../../types';
import { getColumnMatcher } from './helpers';
import { starSingleOrMultipleColumnsValidator } from './transformValidators';

type TransposeTableParams = {
  shouldReserveColumn: (field: string) => boolean;
};

export const paramsValidator = yup.object().shape({
  reserve: starSingleOrMultipleColumnsValidator,
});

const transposeTable = (rows: Row[], params: TransposeTableParams): Row[] => {
  const { shouldReserveColumn } = params;

  return rows
    .map(row => {
      const reservedFields: Record<string, FieldValue> = {};
      const transposeFields: string[] = [];
      Object.entries(row).forEach(([key, value]) => {
        if (shouldReserveColumn(key)) {
          reservedFields[key] = value;
        } else {
          transposeFields.push(key);
        }
      });

      return transposeFields.map(key => ({ ...reservedFields, value: row[key], type: key }));
    })
    .flat();
};

const buildParams = (params: unknown): TransposeTableParams => {
  const validatedParams = paramsValidator.validateSync(params);

  const { reserve } = validatedParams;
  const policyColumns = reserve || [];

  const columnMatcher = getColumnMatcher(policyColumns);
  const shouldReserveColumn = (column: string) => columnMatcher(column);

  return {
    shouldReserveColumn,
  };
};

export const buildTransposeTable = (params: unknown) => {
  const builtParams = buildParams(params);
  return (rows: Row[]) => transposeTable(rows, builtParams);
};
