/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { yup } from '@tupaia/utils';
import { TransformParser } from '../parser';
import { buildWhere } from './where';
import { Row } from '../../types';
import { starSingleOrMultipleColumnsValidator } from './transformValidators';
import { getColumnMatcher } from './helpers';

type ExcludeColumnsParams = {
  shouldIncludeColumn: (field: string) => boolean;
  where: (parser: TransformParser) => boolean;
};

const paramsValidator = yup.object().shape({
  columns: starSingleOrMultipleColumnsValidator,
  where: yup.string(),
});

const excludeColumns = (rows: Row[], params: ExcludeColumnsParams): Row[] => {
  const parser = new TransformParser(rows);
  return rows.map(row => {
    const matchesWhere = params.where(parser);
    if (!matchesWhere) {
      parser.next();
      return row;
    }
    const newRow: Row = {};
    Object.entries(row).forEach(([field, value]) => {
      if (params.shouldIncludeColumn(field)) {
        newRow[field] = value;
      }
    });

    parser.next();
    return newRow;
  });
};

const buildParams = (params: unknown): ExcludeColumnsParams => {
  const { columns } = paramsValidator.validateSync(params);
  if (!columns) {
    throw new Error('columns must be defined');
  }

  const columnMatcher = getColumnMatcher(columns);
  const shouldIncludeColumn = (column: string) => !columnMatcher(column);

  return { shouldIncludeColumn, where: buildWhere(params) };
};

export const buildExcludeColumns = (params: unknown) => {
  const builtParams = buildParams(params);
  return (rows: Row[]) => excludeColumns(rows, builtParams);
};
