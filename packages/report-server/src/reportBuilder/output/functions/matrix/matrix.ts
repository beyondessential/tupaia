/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { yup } from '@tupaia/utils';

import { ReportServerAggregator } from '../../../../aggregator';
import { Row } from '../../../types';
import { MatrixBuilder } from './matrixBuilder';
import { Matrix, MatrixParams } from './types';

const paramsValidator = yup.object().shape(
  {
    columns: yup.lazy((value: unknown) =>
      Array.isArray(value)
        ? yup.array().of(yup.string().required())
        : yup.mixed<'*'>().oneOf(['*'], "columns must be either '*' or an array"),
    ),
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
    dataGroups: yup.array().of(yup.string()).notRequired(),
  },
  [['rowField', 'categoryField']],
);

export const matrix = async (
  rows: Row[],
  params: MatrixParams,
  aggregator: ReportServerAggregator,
): Promise<Matrix> => {
  return new MatrixBuilder(rows, params, aggregator).build();
};

export const buildParams = (params: unknown): MatrixParams => {
  const validatedParams = paramsValidator.validateSync(params);
  const {
    columns = '*',
    categoryField,
    rowField,
    attachAllDataElementsToColumns,
    ...restOfConfigs
  } = validatedParams;
  const includeFields = columns === '*' ? ['*'] : columns;

  const excludeFields = categoryField ? [categoryField, rowField] : [rowField];

  return {
    columns: { includeFields, excludeFields },
    rows: { categoryField, rowField },
    attachAllDataElementsToColumns,
    ...restOfConfigs,
  };
};

export const buildMatrix = (params: unknown) => {
  const builtParams = buildParams(params);
  return (rows: Row[], aggregator: ReportServerAggregator) => matrix(rows, builtParams, aggregator);
};
