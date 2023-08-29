/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { useContext, useState } from 'react';
import styled from 'styled-components';
import { useSearchParams, useLocation } from 'react-router-dom';
import { Clear, Search } from '@material-ui/icons';
import { IconButton, Typography } from '@material-ui/core';
import {
  MatrixColumnType,
  MatrixRowType,
  getIsUsingDots,
  Matrix as MatrixComponent,
  Alert,
  TextField,
} from '@tupaia/ui-components';
import { ConditionalPresentationOptions, MatrixConfig } from '@tupaia/types';
import {
  MatrixReport,
  MatrixReportColumn,
  MatrixReportRow,
} from '../../types';
import { DashboardItemContext } from '../DashboardItem';
import { MOBILE_BREAKPOINT, URL_SEARCH_PARAMS } from '../../constants';

const NoDataMessage = styled(Alert).attrs({
  severity: 'info',
})`
  width: 100%;
  margin: 1rem auto;
  max-width: 24rem;
`;

const SearchInput = styled(TextField)`
  margin-bottom: 0;
  .MuiInputBase-root {
    background-color: transparent;
  }
`;

const PlaceholderWrapper = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const PlaceholderWarningContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(43, 45, 56, 0.8);
  @media (min-width: ${MOBILE_BREAKPOINT}) {
    display: none;
  }
`;

const PlaceholderImage = styled.img`
  max-width: 100%;
`;

const PlaceholderWarningText = styled(Typography)`
  font-size: 1rem;
  padding: 0.5rem;
  text-align: center;
  max-width: 25rem;
`;

// This is a recursive function that parses the rows of the matrix into a format that the Matrix component can use.
const parseRows = (
  rows: MatrixReportRow[],
  categoryId?: MatrixReportRow['categoryId'],
  searchFilter?: string,
  drillDown?: MatrixConfig['drillDown'],
  baseDrillDownLink?: string,
): MatrixRowType[] => {
  const location = useLocation();

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
      const children = parseRows(rows, category, searchFilter, drillDown, baseDrillDownLink);
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
        link: drillDown
          ? {
              ...location,
              search: `${baseDrillDownLink}&${URL_SEARCH_PARAMS.REPORT_DRILLDOWN_ID}=${
                row[drillDown.parameterLink!]
              }`,
            }
          : null,
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

const getPlaceholderImage = ({
  presentationOptions = {},
  categoryPresentationOptions = {},
}: MatrixConfig) => {
  // if the matrix is not using any dots, show a text-only placeholder
  if (!getIsUsingDots(presentationOptions) && !getIsUsingDots(categoryPresentationOptions))
    return '/images/matrix-placeholder-text-only.png';
  // if the matrix has applyLocation.columnIndexes, show a mix placeholder, because this means it is a mix of dots and text
  if ((presentationOptions as ConditionalPresentationOptions)?.applyLocation?.columnIndexes)
    return '/images/matrix-placeholder-mix.png';
  // otherwise, show a dot-only placeholder
  return '/images/matrix-placeholder-dot-only.png';
};

// This function gets the base drilldown link, which is the link that is used for all rows in the matrix, if drilldown is configured.
const getBaseDrilldownLink = (drillDown?: MatrixConfig['drillDown']) => {
  const [urlSearchParams] = useSearchParams();
  if (!drillDown) return '';
  const { itemCode } = drillDown;
  urlSearchParams.set(URL_SEARCH_PARAMS.REPORT, itemCode as string);
  return urlSearchParams.toString();
};

const MatrixPreview = ({ config }: { config?: DashboardItemConfig }) => {
  const placeholderImage = getPlaceholderImage(config as MatrixConfig);
  return (
    <PlaceholderWrapper>
      <PlaceholderWarningContainer>
        <PlaceholderWarningText>
          Please note that the Tupaia matrix chart cannot be properly viewed on small screens.
        </PlaceholderWarningText>
      </PlaceholderWarningContainer>

      <PlaceholderImage src={placeholderImage} alt="Matrix Placeholder" />
    </PlaceholderWrapper>
  );
};

/**
 * This is the component that is used to display a matrix. It handles the parsing of the data into the format that the Matrix component can use, as well as placeholder images. It shows a message when there are no rows available to display.
 */

export const Matrix = () => {
  const { config, report, isEnlarged } = useContext(DashboardItemContext);
  const { columns = [], rows = [] } = report as MatrixReport;
  const [searchFilter, setSearchFilter] = useState('');

  const { periodGranularity, drillDown } = config as MatrixConfig;

  const baseDrillDownLink = getBaseDrilldownLink(drillDown);
  const parsedRows = parseRows(rows, undefined, searchFilter, drillDown, baseDrillDownLink);
  const parsedColumns = parseColumns(columns);

  // in the dashboard, show a placeholder image
  if (!isEnlarged) return <MatrixPreview config={config} />;
  if (!parsedRows.length) return <NoDataMessage>No data available</NoDataMessage>;

  const updateSearchFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchFilter(e.target.value);
  };

  const clearSearchFilter = () => {
    setSearchFilter('');
  };

  return (
    <MatrixComponent
      {...config}
      rows={parsedRows}
      columns={parsedColumns}
      disableExpand={!!searchFilter}
      rowHeaderColumnTitle={
        periodGranularity ? null : (
          <SearchInput
            value={searchFilter}
            onChange={updateSearchFilter}
            placeholder="Search..."
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
        )
      }
    />
  );
};
