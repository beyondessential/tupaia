/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { TransformParser } from '../parser';
import { buildWhere } from './where';
import { Row } from '../../types';

type ExcludeRowsParams = {
  where: (parser: TransformParser) => boolean;
};

const excludeRows = (rows: Row[], params: ExcludeRowsParams): Row[] => {
  const parser = new TransformParser(rows);
  return rows.filter(() => {
    const filterResult = !params.where(parser);
    parser.next();
    return filterResult;
  });
};

const buildParams = (params: unknown): ExcludeRowsParams => {
  return { where: buildWhere(params) };
};

export const buildExcludeRows = (params: unknown) => {
  const builtParams = buildParams(params);
  return (rows: Row[]) => excludeRows(rows, builtParams);
};
