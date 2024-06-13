/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { useContext, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { useSearchParams } from 'react-router-dom';
import { Typography } from '@material-ui/core';
import {
  MatrixColumnType,
  MatrixRowType,
  Matrix as MatrixComponent,
  NoData,
  SearchFilter,
} from '@tupaia/ui-components';
import { formatDataValueByType } from '@tupaia/utils';
import {
  DashboardItemType,
  MatrixConfig,
  MatrixReportColumn,
  MatrixReportRow,
  isMatrixReport,
} from '@tupaia/types';
import { DashboardItemContext } from '../../DashboardItem';
import { MOBILE_BREAKPOINT, URL_SEARCH_PARAMS } from '../../../constants';
import { MatrixPreview } from './MatrixPreview';

const Wrapper = styled.div`
  // override the base table styles to handle expanded rows, which need to be done with classes and JS because nth-child will not handle skipped rows
  tbody .MuiTableRow-root {
    &.odd {
      background-color: ${({ theme }) => theme.palette.table.odd};
    }
    &.even {
      background-color: ${({ theme }) => theme.palette.table.even};
    }
    &.highlighted {
      background-color: ${({ theme }) => theme.palette.table.highlighted};
    }
  }
`;

const NoResultsMessage = styled(Typography)`
  padding: 1rem;
`;

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
const parseRows = (
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
      // if there are no child rows, e.g. because the search filter is hiding them, then we don't need to render this row
      if (!children.length) return result;
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
const parseColumns = (columns: MatrixReportColumn[]): MatrixColumnType[] => {
  return columns.map(column => {
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

/**
 * This is the component that is used to display a matrix. It handles the parsing of the data into the format that the Matrix component can use, as well as placeholder images. It shows a message when there are no rows available to display.
 */

const MatrixVisual = () => {
  const context = useContext(DashboardItemContext);
  const [urlSearchParams, setUrlSearchParams] = useSearchParams();
  const activeDrillDownId = urlSearchParams.get(URL_SEARCH_PARAMS.REPORT_DRILLDOWN_ID);
  const reportPeriod = urlSearchParams.get(URL_SEARCH_PARAMS.REPORT_PERIOD);
  const { report } = context;

  // type guard to ensure that the report is a matrix report and config, even though we know it is
  if (!isMatrixReport(report) || context.config?.type !== DashboardItemType.Matrix) return null;
  const { config } = context;
  const { columns = [], rows = [] } = report;
  const [searchFilters, setSearchFilters] = useState<SearchFilter[]>([]);

  const { drillDown, valueType } = config;

  // memoise the parsed rows and columns so that they don't get recalculated on every render, for performance reasons
  const parsedRows = useMemo(
    () =>
      parseRows(
        rows,
        undefined,
        searchFilters,
        drillDown,
        valueType,
        urlSearchParams,
        setUrlSearchParams,
      ),
    [
      JSON.stringify(rows),
      JSON.stringify(searchFilters),
      JSON.stringify(drillDown),
      valueType,
      JSON.stringify(urlSearchParams),
      setUrlSearchParams,
    ],
  );
  const parsedColumns = useMemo(() => parseColumns(columns), [JSON.stringify(columns)]);

  const updateSearchFilter = ({ key, value }: SearchFilter) => {
    const filtersWithoutKey = searchFilters.filter(filter => filter.key !== key);
    const updatedSearchFilters = value
      ? [
          ...filtersWithoutKey,
          {
            key,
            value,
          },
        ]
      : filtersWithoutKey;

    setSearchFilters(updatedSearchFilters);
  };

  const clearSearchFilter = key => {
    setSearchFilters(searchFilters.filter(filter => filter.key !== key));
  };

  useEffect(() => {
    // if the drillDownId changes, then we need to clear the search filter so that it doesn't persist across different drillDowns
    setSearchFilters([]);
  }, [activeDrillDownId, reportPeriod]);

  if (!parsedRows.length && !searchFilters.length) {
    return <NoData config={config} report={report} />;
  }

  return (
    <Wrapper>
      <MatrixComponent
        {...config}
        rows={parsedRows}
        columns={parsedColumns}
        disableExpand={!!searchFilters.length}
        searchFilters={searchFilters}
        updateSearchFilter={updateSearchFilter}
        clearSearchFilter={clearSearchFilter}
        enableSearch
      />
      {searchFilters?.length > 0 && !parsedRows.length && (
        <NoResultsMessage>No results found</NoResultsMessage>
      )}
    </Wrapper>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  // Make sure there is enough space for the mobile warning text
  @media (max-width: ${MOBILE_BREAKPOINT}) {
    min-height: 5rem;
  }
`;

const MobileWarningText = styled.div`
  font-size: 1rem;
  text-align: center;
  width: 100%;
  padding: 0.5rem 0.5rem 1rem;

  @media (min-width: ${MOBILE_BREAKPOINT}) {
    display: none;
  }
`;

const MobileWarning = () => {
  return (
    <MobileWarningText>
      Please note that the Tupaia matrix chart cannot be properly viewed on small screens.
    </MobileWarningText>
  );
};

export const Matrix = () => {
  const { isEnlarged, config } = useContext(DashboardItemContext);
  // add a typeguard here to keep TS happy
  // if the item is not enlarged and is a matrix, then we show the preview, because there won't be any loaded data at this point

  if (config?.type !== DashboardItemType.Matrix) return null;

  const component = isEnlarged ? <MatrixVisual /> : <MatrixPreview config={config} />;

  return (
    <Container>
      <MobileWarning />
      {component}
    </Container>
  );
};
