/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router';
import { Clear, Search } from '@material-ui/icons';
import { IconButton } from '@material-ui/core';
import {
  MatrixColumnType,
  MatrixRowType,
  getIsUsingDots,
  Matrix as MatrixComponent,
  Alert,
  TextField,
} from '@tupaia/ui-components';
import { ConditionalPresentationOptions } from '@tupaia/types';
import { DashboardItemType, MatrixReport, MatrixReportColumn, MatrixReportRow } from '../types';
import { useDashboards } from '../api/queries';

const NoDataMessage = styled(Alert).attrs({
  severity: 'info',
})`
  width: 100%;
  margin: 1rem auto;
  max-width: 24rem;
`;

const SearchInput = styled(TextField)`
  .MuiInputBase-root {
    background-color: transparent;
  }
`;

const SearchWrapper = styled.div`
  width: 100%;
  max-width: 20rem;
`;

// This is a recursive function that parses the rows of the matrix into a format that the Matrix component can use.
const parseRows = (
  rows: MatrixReportRow[],
  categoryId?: MatrixReportRow['categoryId'],
  searchFilter?: string,
): MatrixRowType[] => {
  let topLevelRows = [];
  // if a categoryId is not passed in, then we need to find the top level rows
  if (!categoryId) {
    // get the highest level rows, which are the ones that have a category but no categoryId
    const highestLevel = rows.filter(row => row.category && !row.categoryId);
    // if there are no highest level rows, then the top level rows are just all of the rows
    topLevelRows = highestLevel.length ? highestLevel : rows;
  } else {
    // otherwise, the top level rows are the ones that have the categoryId that was passed in
    topLevelRows = rows.filter(row => row.categoryId === categoryId);
  }

  // loop through the topLevelRows, and parse them into the format that the Matrix component can use
  return topLevelRows.reduce((result, row) => {
    const { dataElement = '', category, ...rest } = row;
    // if the row has a category, then it has children, so we need to parse them using this same function
    if (category) {
      const children = parseRows(rows, category, searchFilter);
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
    if (searchFilter && !dataElement.toLowerCase().includes(searchFilter.toLowerCase()))
      return result;
    // otherwise, handle as a regular row
    return [
      ...result,
      {
        title: dataElement,
        ...rest,
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

const getPlaceholderImage = ({ presentationOptions = {}, categoryPresentationOptions = {} }) => {
  // if the matrix is not using any dots, show a text-only placeholder
  if (!getIsUsingDots(presentationOptions) && !getIsUsingDots(categoryPresentationOptions))
    return '/images/matrix-placeholder-text-only.png';
  // if the matrix has applyLocation.columnIndexes, show a mix placeholder, because this means it is a mix of dots and text
  if ((presentationOptions as ConditionalPresentationOptions)?.applyLocation?.columnIndexes)
    return '/images/matrix-placeholder-mix.png';
  // otherwise, show a dot-only placeholder
  return '/images/matrix-placeholder-dot-only.png';
};

/**
 * This is the component that is used to display a matrix. It handles the parsing of the data into the format that the Matrix component can use, as well as placeholder images. It shows a message when there are no rows available to display.
 */

interface MatrixProps {
  config: DashboardItemType;
  report: MatrixReport;
  isEnlarged?: boolean;
}
export const Matrix = ({ config, report, isEnlarged = false }: MatrixProps) => {
  const { columns = [], rows = [] } = report;
  const [searchFilter, setSearchFilter] = useState('');
  const { projectCode, entityCode, dashboardName } = useParams();

  const { activeDashboard } = useDashboards(projectCode, entityCode, dashboardName);
  const placeholderImage = getPlaceholderImage(config);
  // in the dashboard, show a placeholder image
  if (!isEnlarged) return <img src={placeholderImage} alt="Matrix Placeholder" />;

  const parsedRows = parseRows(rows, undefined, searchFilter);
  const parsedColumns = parseColumns(columns);

  if (!parsedRows.length) return <NoDataMessage>No data available</NoDataMessage>;
  const { periodGranularity, drillDown } = config;

  // Use the first row's data element as a placeholder text if possible
  const placeholderText = rows.length > 0 ? `E.g. ${rows[0].dataElement}` : 'Search Rows';

  const updateSearchFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchFilter(e.target.value);
  };

  const clearSearchFilter = () => {
    setSearchFilter('');
  };

  const handleClickRow = (rowTitle: any) => {
    const { keyLink, parameterLink, itemCode } = drillDown;
    const activeRow = parsedRows.find(row => row.title === rowTitle);
    if (!activeRow) return;
    const params = {
      dashboardCode: activeDashboard?.dashboardCode,
      drillDownLevel: 1,
      isExpanded: true,
      itemCode,
      legacy: config?.legacy,
      organisationUnitCode: entityCode,
      projectCode,
      [parameterLink]: activeRow[parameterLink] || undefined,
    };
    console.log(params);
  };
  return (
    <>
      {/** If no datepicker, allow the user to filter the rows */}
      {!periodGranularity && (
        <SearchWrapper>
          <SearchInput
            value={searchFilter}
            onChange={updateSearchFilter}
            placeholder={placeholderText}
            InputProps={{
              endAdornment: searchFilter ? (
                <IconButton onClick={clearSearchFilter}>
                  <Clear />
                </IconButton>
              ) : (
                <Search />
              ),
            }}
          />
        </SearchWrapper>
      )}
      <MatrixComponent
        {...config}
        rows={parsedRows}
        columns={parsedColumns}
        disableExpand={!!searchFilter}
        onClickRow={drillDown ? handleClickRow : undefined}
      />
    </>
  );
};
