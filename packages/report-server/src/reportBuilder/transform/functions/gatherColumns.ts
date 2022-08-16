/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { yup } from '@tupaia/utils';
import { Row, FieldValue } from '../../types';
import { getColumnMatcher } from './helpers';
import { gatherColumnsValidator } from './transformValidators';

type GatherColumnsParams = {
  shouldKeepColumn: (field: string) => boolean;
};

export const paramsValidator = yup.object().shape({
  keep: gatherColumnsValidator,
});

const gatherColumns = (rows: Row[], params: GatherColumnsParams): Row[] => {
  const { shouldKeepColumn } = params;

  return rows
    .map(row => {
      const keptFields: Record<string, FieldValue> = {};
      const gatherFields: string[] = [];

      Object.entries(row).forEach(([key, value]) => {
        if (shouldKeepColumn(key)) {
          keptFields[key] = value;
        } else {
          gatherFields.push(key);
        }
      });

      return gatherFields.map(key => ({ ...keptFields, value: row[key], type: key }));
    })
    .flat();
};

const buildParams = (params: unknown): GatherColumnsParams => {
  const validatedParams = paramsValidator.validateSync(params);

  const { keep } = validatedParams;
  const policyColumns = keep || [];

  const columnMatcher = getColumnMatcher(policyColumns);
  const shouldKeepColumn = (column: string) => columnMatcher(column);

  return {
    shouldKeepColumn,
  };
};

export const buildGatherColumns = (params: unknown) => {
  const builtParams = buildParams(params);
  return (rows: Row[]) => gatherColumns(rows, builtParams);
};
