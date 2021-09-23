/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { yup } from '@tupaia/utils';

import { Response } from '../../types';
import { MatrixBuilder } from './matrixBuilder';
import { MatrixParams } from './types';

const paramsValidator = yup.object().shape(
  {
    columns: yup.lazy((value: unknown) =>
      Array.isArray(value)
        ? yup.array().of(yup.string().required())
        : yup.mixed<'*'>().oneOf(['*'], "columns must be either '*' or an array"),
    ),
    excludeFields: yup.array().of(yup.string().required()),
    rowField: yup
      .string()
      .required()
      .when('categoryField', (categoryField: string | undefined, schema: yup.StringSchema) =>
        categoryField !== undefined
          ? schema.notOneOf(
              [categoryField],
              `rowField cannot be: ${categoryField}, it is already specified as categoryField`,
            )
          : schema,
      )
      .when('columns', (columns: '*' | string[] | undefined, schema: yup.StringSchema) =>
        Array.isArray(columns)
          ? schema.notOneOf(
              columns,
              `rowField cannot be one of: [${columns}] they are already specified as columns`,
            )
          : schema,
      ),
    categoryField: yup
      .string()
      .when('rowField', (rowField: string, schema: yup.StringSchema) =>
        schema.notOneOf(
          [rowField],
          `categoryField cannot be: ${rowField}, it is already specified as rowField`,
        ),
      )
      .when('columns', (columns: '*' | string[] | undefined, schema: yup.StringSchema) =>
        Array.isArray(columns)
          ? schema.notOneOf(
              columns,
              `categoryField cannot be one of: [${columns}] they are already specified as columns`,
            )
          : schema,
      ),
  },
  [['rowField', 'categoryField']],
);

const matrix = (response: Response, params: MatrixParams) => {
  return new MatrixBuilder(response, params).build();
};

const buildParams = (params: unknown): MatrixParams => {
  const validatedParams = paramsValidator.validateSync(params);
  const {
    columns = '*',
    excludeFields: excludeFieldsParams = [],
    categoryField,
    rowField,
  } = validatedParams;

  const excludeFields = categoryField
    ? [categoryField, rowField, ...excludeFieldsParams]
    : [rowField, ...excludeFieldsParams];

  return {
    columns: { includeFields: columns, excludeFields },
    rows: { categoryField, rowField },
  };
};

export const buildMatrix = (params: unknown) => {
  const builtParams = buildParams(params);
  return (response: Response) => matrix(response, builtParams);
};
