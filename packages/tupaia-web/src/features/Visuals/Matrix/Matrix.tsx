/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { useContext, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { useSearchParams, useParams } from 'react-router-dom';
import { Typography } from '@material-ui/core';
import { Matrix as MatrixComponent, NoData, SearchFilter } from '@tupaia/ui-components';
import { DashboardItemType, isMatrixReport } from '@tupaia/types';
import { DashboardItemContext } from '../../DashboardItem';
import { MOBILE_BREAKPOINT, URL_SEARCH_PARAMS } from '../../../constants';
import { MatrixPreview } from './MatrixPreview';
import { parseColumns, parseRows } from './parseData';

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

/**
 * This is the component that is used to display a matrix. It handles the parsing of the data into the format that the Matrix component can use, as well as placeholder images. It shows a message when there are no rows available to display.
 */

const MatrixVisual = () => {
  const context = useContext(DashboardItemContext);
  const { projectCode } = useParams();
  const [urlSearchParams, setUrlSearchParams] = useSearchParams();
  const activeDrillDownId = urlSearchParams.get(URL_SEARCH_PARAMS.REPORT_DRILLDOWN_ID);
  const reportPeriod = urlSearchParams.get(URL_SEARCH_PARAMS.REPORT_PERIOD);
  const { report } = context;

  // type guard to ensure that the report is a matrix report and config, even though we know it is
  if (!isMatrixReport(report) || context.config?.type !== DashboardItemType.Matrix) return null;
  const { config } = context;
  const { columns = [], rows = [] } = report;
  const [searchFilters, setSearchFilters] = useState<SearchFilter[]>([]);

  // memoise the parsed rows and columns so that they don't get recalculated on every render, for performance reasons
  const parsedRows = useMemo(
    () =>
      parseRows(
        rows,
        undefined,
        searchFilters,
        config,
        urlSearchParams,
        setUrlSearchParams,
        projectCode!,
      ),
    [
      JSON.stringify(rows),
      JSON.stringify(searchFilters),
      JSON.stringify(config),
      JSON.stringify(urlSearchParams),
      setUrlSearchParams,
      projectCode,
    ],
  );
  const parsedColumns = useMemo(
    () => parseColumns(columns, projectCode!),
    [JSON.stringify(columns), projectCode],
  );

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
