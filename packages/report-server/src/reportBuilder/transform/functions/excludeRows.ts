/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { yup } from '@tupaia/utils';
import { TransformParser } from '../parser';
import { buildWhere } from './where';
import { Context } from '../../context';
import { Row } from '../../types';

type ExcludeRowsParams = {
  where: (parser: TransformParser) => boolean;
};

export const paramsValidator = yup.object().shape({
  where: yup.string(),
});

const excludeRows = (rows: Row[], params: ExcludeRowsParams, context: Context): Row[] => {
  const parser = new TransformParser(rows, context);
  return rows.filter(() => {
    const filterResult = !params.where(parser);
    parser.next();
    return filterResult;
  });
};

const buildParams = (params: unknown): ExcludeRowsParams => {
  paramsValidator.validateSync(params);
  return { where: buildWhere(params) };
};

export const buildExcludeRows = (params: unknown, context: Context) => {
  const builtParams = buildParams(params);
  return (rows: Row[]) => excludeRows(rows, builtParams, context);
};
