/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import { MatrixColumnType, MatrixRowType, SearchFilter } from '@tupaia/ui-components';
import { formatDataValueByType } from '@tupaia/utils';
import { MatrixConfig, MatrixReportColumn, MatrixReportRow } from '@tupaia/types';
import { URL_SEARCH_PARAMS } from '../../../constants';

const getValueMatchesSearchFilter = (value: any, searchTerm: SearchFilter['value']) => {
  if (typeof value !== 'string' && typeof value !== 'number') return false;
  const stringifiedValue = value.toString().toLowerCase();
  const lowercaseSearchTerm = searchTerm.toLowerCase();
  // handle % search - if the search term starts with %, then we want to check if the value includes the search term
  if (lowercaseSearchTerm.startsWith('%')) {
    const searchTermWithoutPercent = lowercaseSearchTerm.slice(1);
    return stringifiedValue.includes(searchTermWithoutPercent);
  }

  // otherwise, check if the value starts with the search term
  return stringifiedValue.startsWith(lowercaseSearchTerm);
};

const getRowMatchesSearchFilter = (row: MatrixReportRow, searchFilters: SearchFilter[]) => {
  return searchFilters.every(filter => {
    const rowValue = row[filter.key];
    return getValueMatchesSearchFilter(rowValue, filter.value);
  });
};

// This is a recursive function that parses the rows of the matrix into a format that the Matrix component can use.
export const parseRows = (
  rows: MatrixReportRow[],
  categoryId: MatrixReportRow['categoryId'] | undefined,
  searchFilters: SearchFilter[],
  drillDown: MatrixConfig['drillDown'] | undefined,
  valueType: MatrixConfig['valueType'] | undefined,
  urlSearchParams: URLSearchParams,
  setUrlSearchParams: (searchParams: URLSearchParams) => void,
): MatrixRowType[] => {
  const onDrillDown = row => {
    if (!drillDown) return;
    const { itemCode, parameterLink } = drillDown;
    if (!parameterLink || !itemCode) return;
    urlSearchParams?.set(URL_SEARCH_PARAMS.REPORT, itemCode);
    urlSearchParams?.set(URL_SEARCH_PARAMS.REPORT_DRILLDOWN_ID, row[parameterLink]);
    setUrlSearchParams(urlSearchParams);
  };

  let topLevelRows: MatrixReportRow[] = [];
  // if a categoryId is not passed in, then we need to find the top level rows
  if (!categoryId) {
    // get the highest level rows, which are the ones that have a category but no categoryId
    const highestLevel = rows.filter(row => !row.categoryId);
    // if there are no highest level rows, then the top level rows are just all of the rows
    topLevelRows = highestLevel.length ? highestLevel : rows;
  } else {
    // otherwise, the top level rows are the ones that have the categoryId that was passed in
    topLevelRows = rows.filter(row => row.categoryId === categoryId);
  }
  // loop through the topLevelRows, and parse them into the format that the Matrix component can use
  return topLevelRows.reduce((result: MatrixRowType[], row: MatrixReportRow) => {
    const { dataElement = '', category, valueType: rowValueType, ...rest } = row;
    const valueTypeToUse = rowValueType || valueType;
    // if the row has a category, then it has children, so we need to parse them using this same function

    if (category) {
      const children = parseRows(
        rows,
        category,
        searchFilters,
        drillDown,
        valueTypeToUse,
        urlSearchParams,
        setUrlSearchParams,
      );

      if (searchFilters.length > 0) {
        const topLevelRowMatchesSearchFilter = getRowMatchesSearchFilter(
          {
            dataElement: category,
            ...rest,
          },
          searchFilters,
        );
        if (!topLevelRowMatchesSearchFilter && !children.length) return result;
      }

      result.push({
        title: category,
        ...rest,
        children,
      });
      return result;
    }

    const formattedRowValues = Object.entries(rest).reduce((acc, [key, item]) => {
      // some items are objects, and we need to parse them to get the value
      if (typeof item === 'object' && item !== null) {
        const { value, metadata } = item as { value: any; metadata?: any };

        acc[key] = formatDataValueByType(
          {
            value,
            metadata,
          },
          valueTypeToUse,
        );

        return acc;
      }
      acc[key] = formatDataValueByType({ value: item }, valueTypeToUse);
      return acc;
    }, {});

    // if the row is a regular row, and there is a search filter, then we need to check if the row matches the search filter, and ignore this row if it doesn't. This filter only applies to standard rows, not category rows.
    if (searchFilters?.length > 0) {
      const matchesSearchFilter = getRowMatchesSearchFilter(
        {
          dataElement,
          ...formattedRowValues,
        },
        searchFilters,
      );

      if (!matchesSearchFilter) return result;
    }
    // otherwise, handle as a regular row
    result.push({
      title: dataElement,
      onClick: drillDown ? () => onDrillDown(row) : undefined,
      ...formattedRowValues,
    });
    return result;
  }, []);
};

// This is a recursive function that parses the columns of the matrix into a format that the Matrix component can use.
export const parseColumns = (columns: MatrixReportColumn[]): MatrixColumnType[] => {
  return columns
    .filter(column => column.key !== 'dataElement_link')
    .map(column => {
      const { category, key, title, columns: children } = column;
      // if a column has a category, then it has children, so we need to parse them using this same function
      if (category)
        return {
          title: category,
          key: category,
          children: parseColumns(children!),
        };
      // otherwise, handle as a regular column
      return {
        title,
        key,
      };
    });
};
