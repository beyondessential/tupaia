/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { yup } from '@tupaia/utils';

import { FieldValue, Row } from '../../../types';
import { Context } from '../../../context';
import { TransformParser } from '../../parser';
import { TransformTable } from '../../table';
import { checkColumnsExistInTable, expressionOrArrayValidator } from '../utils';
import { generateRowInserts } from './generateRowInserts';

type FillRowsParams = {
  requiredColumnValues: { column: string; values: string | FieldValue[] }[];
  missingRowValues: Row;
};

const parsedRequiredColumnValuesValidator = yup
  .array(yup.object().shape({ column: yup.string().required(), values: yup.array().required() }))
  .required();

export const paramsValidator = yup.object().shape({
  requiredColumnValues: yup
    .array(
      yup.object().shape({ column: yup.string().required(), values: expressionOrArrayValidator }),
    )
    .required(),
  missingRowValues: yup.object(),
});

const fillRows = (table: TransformTable, params: FillRowsParams, context: Context) => {
  const { requiredColumnValues: inputRequiredColumnValues, missingRowValues } = params;

  const parser = new TransformParser(table, context);
  const parsedRequiredColumnValues = inputRequiredColumnValues.map(({ column, values }) => ({
    column,
    values: TransformParser.isExpression(values) ? parser.evaluate(values) : values,
  }));
  const requiredColumnValues = parsedRequiredColumnValuesValidator.validateSync(
    parsedRequiredColumnValues,
  );

  checkColumnsExistInTable(
    requiredColumnValues.map(({ column }) => column),
    table,
    'Invalid columns in requiredColumnValues.',
  );

  checkColumnsExistInTable(
    Object.keys(missingRowValues),
    table,
    'Invalid columns in missingRowValues.',
  );

  const rowsToInsert = generateRowInserts(table, parser, requiredColumnValues, missingRowValues);
  const newTable = table.insertRows(rowsToInsert);
  return newTable;
};

const buildParams = (params: unknown) => {
  const validatedParams = paramsValidator.validateSync(params);

  const { requiredColumnValues, missingRowValues } = validatedParams;

  return {
    requiredColumnValues,
    missingRowValues,
  };
};

export const buildFillsRows = (params: unknown, context: Context) => {
  const builtParams = buildParams(params);
  return (table: TransformTable) => fillRows(table, builtParams, context);
};
