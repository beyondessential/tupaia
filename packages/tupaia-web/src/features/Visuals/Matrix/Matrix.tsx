/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { useContext, useEffect, useState } from 'react';
import styled from 'styled-components';
import { useSearchParams } from 'react-router-dom';
import { Clear, Search } from '@material-ui/icons';
import { IconButton, Typography } from '@material-ui/core';
import {
  MatrixColumnType,
  MatrixRowType,
  Matrix as MatrixComponent,
  TextField,
  NoData,
  SearchFilter,
} from '@tupaia/ui-components';
import { formatDataValueByType } from '@tupaia/utils';
import { MatrixConfig, MatrixReportColumn, MatrixReportRow, isMatrixReport } from '@tupaia/types';
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
  // handle % search - if the search term starts with %, then we want to check if the value includes the search term
  if (searchTerm.startsWith('%')) {
    const searchTermWithoutPercent = searchTerm.slice(1);
    return stringifiedValue.includes(searchTermWithoutPercent);
  }

  // otherwise, check if the value starts with the search term
  return stringifiedValue.startsWith(searchTerm);
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

  let topLevelRows = [] as MatrixReportRow[];
  // if a categoryId is not passed in, then we need to find the top level rows
  if (!categoryId) {
    // get the highest level rows, which are the ones that have a category but no categoryId
    const highestLevel = rows.filter(row => !row.categoryId) as MatrixReportRow[];
    // if there are no highest level rows, then the top level rows are just all of the rows
    topLevelRows = highestLevel.length ? highestLevel : rows;
  } else {
    // otherwise, the top level rows are the ones that have the categoryId that was passed in
    topLevelRows = rows.filter(row => row.categoryId === categoryId);
  }
  // loop through the topLevelRows, and parse them into the format that the Matrix component can use
  return topLevelRows.reduce((result, row) => {
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
      return [
        ...result,
        {
          title: category,
          ...rest,
          children,
        },
      ];
    }
    // if the row is a regular row, and there is a search filter, then we need to check if the row matches the search filter, and ignore this row if it doesn't. This filter only applies to standard rows, not category rows.
    if (searchFilters?.length > 0) {
      const matchesSearchFilter = getRowMatchesSearchFilter(row, searchFilters);

      if (!matchesSearchFilter) return result;
    }
    // otherwise, handle as a regular row
    return [
      ...result,
      {
        title: dataElement,
        onClick: drillDown ? () => onDrillDown(row) : undefined,
        ...Object.entries(rest).reduce((acc, [key, item]) => {
          // some items are objects, and we need to parse them to get the value
          if (typeof item === 'object' && item !== null) {
            const { value, metadata } = item as { value: any; metadata?: any };
            return {
              ...acc,
              [key]: formatDataValueByType(
                {
                  value,
                  metadata,
                },
                valueTypeToUse,
              ),
            };
          }
          return {
            ...acc,
            [key]: formatDataValueByType({ value: item }, valueTypeToUse),
          };
        }, {}),
      },
    ];
  }, [] as MatrixRowType[]);
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

  const { report, isEnlarged } = context;

  // While we know that this component only ever gets a MatrixConfig, the Matrix component doesn't know that as it all comes from the same context, so we cast it here so it trickles down to child components
  const config = context.config as MatrixConfig;
  // type guard to ensure that the report is a matrix report, even though we know it is
  if (!isMatrixReport(report)) return null;
  const { columns = [], rows = [] } = report;
  const [searchFilters, setSearchFilters] = useState<SearchFilter[]>([]);

  const { drillDown, valueType } = config;

  // in the dashboard, show a placeholder image
  if (!isEnlarged) {
    return <MatrixPreview config={config} />;
  }

  const parsedRows = parseRows(
    rows,
    undefined,
    searchFilters,
    drillDown,
    valueType,
    urlSearchParams,
    setUrlSearchParams,
  );

  const parsedColumns = parseColumns(columns);

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
  }, [activeDrillDownId]);

  if (!parsedRows.length && !searchFilters) {
    return <NoData config={config} report={report} />;
  }

  return (
    <Wrapper>
      <MatrixComponent
        // casting here because we know that the config is a MatrixConfig and it has a different shape than configs of other types, and while we know that this component only ever gets a MatrixConfig, the Matrix component doesn't know that as it all comes from the same context
        {...config}
        rows={parsedRows}
        columns={parsedColumns}
        disableExpand={!!searchFilters.length}
        searchFilters={searchFilters}
        updateSearchFilter={updateSearchFilter}
        clearSearchFilter={clearSearchFilter}
        enableSearch
        // rowHeaderColumnTitle={
        //   periodGranularity ? null : (
        //     <SearchInput
        //       value={searchFilter}
        //       onChange={updateSearchFilter}
        //       placeholder="Search..."
        //       InputProps={{
        //         endAdornment: searchFilter ? (
        //           <IconButton onClick={clearSearchFilter}>
        //             <Clear />
        //           </IconButton>
        //         ) : (
        //           <Search />
        //         ),
        //       }}
        //     />
        //   )
        // }
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
  return (
    <Container>
      <MobileWarning />
      <MatrixVisual />
    </Container>
  );
};
