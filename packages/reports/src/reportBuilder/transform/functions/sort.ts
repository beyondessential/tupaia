import { Row } from '../../reportBuilder';
import { functions, parseExpression } from '../../functions';
import { parser } from 'mathjs';

type SortParams = {
  by: string;
  descending?: boolean;
};

const getRowSortFunction = (params: SortParams, descending = false) => {
  return (row1: Row, row2: Row) => {
    const row1Parser = parser();
    row1Parser.set('$', row1);
    Object.entries(functions).forEach(([name, call]) => row1Parser.set(name, call));

    const row2Parser = parser();
    row2Parser.set('$', row2);
    Object.entries(functions).forEach(([name, call]) => row2Parser.set(name, call));

    const row1Value = parseExpression(row1Parser, params.by);
    const row2Value = parseExpression(row2Parser, params.by);

    if (row1Value === undefined || row2Value === undefined) {
      throw new Error(`Unexpected undefined value when sorting rows: ${row1}, ${row2}`);
    }

    if (descending) {
      if (row1Value < row2Value) {
        return 1;
      } else if (row1Value === row2Value) {
        return 0;
      }
      return -1;
    }

    if (row1Value > row2Value) {
      return 1;
    } else if (row1Value === row2Value) {
      return 0;
    }
    return -1;
  };
};

const sort = (rows: Row[], params: SortParams): Row[] => {
  const { descending } = params;
  return rows.sort(getRowSortFunction(params, descending));
};

const buildParams = (params: unknown): SortParams => {
  if (typeof params !== 'object' || params === null) {
    throw new Error(`Expected params object but got ${params}`);
  }

  const { descending, by } = params;
  if (descending !== undefined && typeof descending !== 'boolean') {
    throw new Error(`Expected boolean for 'descending' parameter but got ${descending}`);
  }

  if (typeof by !== 'string') {
    throw new Error(`Expected string for 'by' parameter but got ${by}`);
  }

  return {
    by,
    descending,
  };
};

export const buildSort = (params: unknown) => {
  const builtSortParams = buildParams(params);
  return (rows: Row[]) => sort(rows, builtSortParams);
};
