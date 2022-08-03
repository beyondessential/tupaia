/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { yup } from '@tupaia/utils';
import { Row, FieldValue } from '../../types';
import { getColumnMatcher } from './helpers';
import { starSingleOrMultipleColumnsValidator } from './transformValidators';

type TransposeTableParams = {
  shouldIncludeColumn: (field: string) => boolean;
};

export const paramsValidator = yup.object().shape({
  include: starSingleOrMultipleColumnsValidator,
});

const transposeTable = (rows: Row[], params: TransposeTableParams): Row[] => {
  const { shouldIncludeColumn } = params;

  return rows
    .map(row => {
      const includedFields: Record<string, FieldValue> = {};
      const transposeFields: string[] = [];
      Object.entries(row).forEach(([key, value]) => {
        if (shouldIncludeColumn(key)) {
          includedFields[key] = value;
        } else {
          transposeFields.push(key);
        }
      });

      return transposeFields.map(key => ({ ...includedFields, value: row[key], type: key }));
    })
    .flat();
};

const buildParams = (params: unknown): TransposeTableParams => {
  const validatedParams = paramsValidator.validateSync(params);

  const { include } = validatedParams;
  const policyColumns = include || [];

  const columnMatcher = getColumnMatcher(policyColumns);
  const shouldIncludeColumn = (column: string) => columnMatcher(column);

  return {
    shouldIncludeColumn,
  };
};

export const buildTransposeTable = (params: unknown) => {
  const builtParams = buildParams(params);
  return (rows: Row[]) => transposeTable(rows, builtParams);
};
