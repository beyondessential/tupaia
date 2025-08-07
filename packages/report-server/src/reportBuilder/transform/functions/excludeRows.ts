import { yup } from '@tupaia/utils';
import { TransformParser } from '../parser';
import { buildWhere } from './where';
import { Context } from '../../context';
import { TransformTable } from '../table';
import { TransformBuilder } from '.';

type ExcludeRowsParams = {
  where: (parser: TransformParser) => boolean;
};

export const paramsValidator = yup.object().shape({
  where: yup.string(),
});

const excludeRows = (table: TransformTable, params: ExcludeRowsParams, context: Context) => {
  const parser = new TransformParser(table, context);
  const rowsToDelete: number[] = [];
  table.getRows().forEach((_, index) => {
    const shouldDeleteRow = params.where(parser);
    parser.next();
    if (shouldDeleteRow) {
      rowsToDelete.push(index);
    }
  });

  return table.dropRows(rowsToDelete);
};

const buildParams = (params: unknown): ExcludeRowsParams => {
  paramsValidator.validateSync(params);
  return { where: buildWhere(params) };
};

export const buildExcludeRows: TransformBuilder = (params, context) => {
  const builtParams = buildParams(params);
  return table => excludeRows(table, builtParams, context);
};
