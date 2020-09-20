import { functions, parseParams } from '../../functions';

export const sort = (rows, params) => {
  const { descending, ...restOfSortFunctions } = params;
  const sortFunctionName = Object.keys(restOfSortFunctions)[0];
  return rows.sort(getRowSortFunction(params, sortFunctionName, descending));
};

const getRowSortFunction = (params, sortFunctionName, descending = false) => {
  return (row1, row2) => {
    const { [sortFunctionName]: row1SortFunctionParameters } = parseParams(row1, params);
    const { [sortFunctionName]: row2SortFunctionParameters } = parseParams(row2, params);
    const row1Value = functions[sortFunctionName](row1SortFunctionParameters);
    const row2Value = functions[sortFunctionName](row2SortFunctionParameters);

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
