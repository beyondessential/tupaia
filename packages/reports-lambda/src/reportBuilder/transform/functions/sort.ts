import { FieldValue, Row } from '../../reportBuilder';
import { functions, functionBuilders } from '../../functions';

export type SortParams = {
  sortOrderFunction: (row: Row) => FieldValue;
  descending: boolean;
};

const getRowSortFunction = (params: SortParams, descending = false) => {
  return (row1: Row, row2: Row) => {
    const row1Value = params.sortOrderFunction(row1);
    const row2Value = params.sortOrderFunction(row2);

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

export const sort = (rows: Row[], params: SortParams): Row[] => {
  const { descending } = params;
  return rows.sort(getRowSortFunction(params, descending));
};

const buildSortParams = (params: unknown): SortParams => {
  if (typeof params !== 'object' || params === null) {
    throw new Error(`Expected params object but got ${params}`);
  }

  const { descending, ...restOfParams } = params;
  if (typeof descending !== 'boolean') {
    throw new Error(`Expected string for 'as' parameter but got ${descending}`);
  }

  const sortOrderFunctionList = Object.entries(restOfParams) as [string, unknown];
  if (sortOrderFunctionList.length < 1 || sortOrderFunctionList.length > 1) {
    throw new Error(`Expected a single transform defined but got ${sortOrderFunctionList.length}`);
  }

  const sortOrderFunction = sortOrderFunctionList[0][0] as keyof typeof functions;
  const sortOrderParams = sortOrderFunctionList[0][1] as unknown;
  if (!(sortOrderFunction in functions)) {
    throw new Error(
      `Expected a transform to be one of ${Object.keys(functions)} but got ${sortOrderFunction}`,
    );
  }

  return {
    sortOrderFunction: functionBuilders[sortOrderFunction](sortOrderParams),
    descending,
  };
};

export const buildSort = (params: unknown) => {
  const builtSortParams = buildSortParams(params);
  return (rows: Row[]) => sort(rows, builtSortParams);
};
