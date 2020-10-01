import { functionBuilders, parseToken } from '../../functions';
import { buildWhere } from './where';
import { FieldValue, Row } from '../../reportBuilder';

type SelectParams = {
  select: (row: Row) => FieldValue;
  where: (row: Row) => boolean;
  as: string;
};

const select = (rows: Row[], params: SelectParams): Row[] => {
  return rows.map(row => {
    if (!params.where(row)) {
      return { ...row };
    }

    const as = parseToken(row, params.as);
    if (typeof as !== 'string') {
      throw new Error(`Expected select 'as' to be string, but got ${as}`);
    }

    const selectionResult = params.select(row);
    const rowWithSelection = { ...row };
    if (selectionResult !== undefined || selectionResult !== null) {
      rowWithSelection[as] = selectionResult;
    }
    return rowWithSelection;
  });
};

const buildParams = (params: unknown): SelectParams => {
  if (typeof params !== 'object' || params === null) {
    throw new Error(`Expected params object but got ${params}`);
  }

  const { as, where, ...restOfParams } = params;
  if (typeof as !== 'string') {
    throw new Error(`Expected string for 'as' parameter but got ${as}`);
  }

  const selectFunctionList = Object.entries(restOfParams) as [string, unknown];
  if (selectFunctionList.length < 1 || selectFunctionList.length > 1) {
    throw new Error(`Expected a single transform defined but got ${selectFunctionList.length}`);
  }

  const select = selectFunctionList[0][0] as keyof typeof functionBuilders;
  const selectParams = selectFunctionList[0][1] as unknown;
  if (!(select in functionBuilders)) {
    throw new Error(
      `Expected a transform to be one of ${Object.keys(functionBuilders)} but got ${select}`,
    );
  }

  return {
    select: functionBuilders[select](selectParams),
    where: buildWhere(params),
    as,
  };
};

export const buildSelect = (params: unknown) => {
  const builtParams = buildParams(params);
  return (rows: Row[]) => select(rows, builtParams);
};
