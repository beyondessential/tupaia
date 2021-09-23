/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { yup } from '@tupaia/utils';

import { Row } from '../../../types';
import { MatrixBuilder } from './matrixBuilder';
import { Matrix, MatrixParams } from './types';

const paramsValidator = yup.object().shape(
  {
    columns: yup.lazy((value: unknown) =>
      Array.isArray(value)
        ? yup.array().of(yup.string().required())
        : yup.mixed<'*'>().oneOf(['*']),
    ),
    rowField: yup
      .string()
      .required()
      .when('categoryField', (categoryField: string | undefined, schema: yup.StringSchema) =>
        categoryField !== undefined ? schema.notOneOf([categoryField]) : schema,
      )
      .when('columns', (columns: '*' | string[] | undefined, schema: yup.StringSchema) =>
        Array.isArray(columns) ? schema.notOneOf(columns) : schema,
      ),
    categoryField: yup
      .string()
      .when('rowField', (rowField: string, schema: yup.StringSchema) => schema.notOneOf([rowField]))
      .when('columns', (columns: '*' | string[] | undefined, schema: yup.StringSchema) =>
        Array.isArray(columns) ? schema.notOneOf(columns) : schema,
      ),
  },
  [['rowField', 'categoryField']],
);

const matrix = (rows: Row[], params: MatrixParams): Matrix => {
  return new MatrixBuilder(rows, params).build();
};

const buildParams = (params: unknown): MatrixParams => {
  const validatedParams = paramsValidator.validateSync(params);
  const { columns, categoryField, rowField } = validatedParams;
  const includeFields = columns || '*';

  const excludeFields = categoryField ? [categoryField, rowField] : [rowField];

  return {
    columns: { includeFields, excludeFields },
    rows: { categoryField, rowField },
  };
};

export const buildMatrix = (params: unknown) => {
  const builtParams = buildParams(params);
  return (rows: Row[]) => matrix(rows, builtParams);
};
