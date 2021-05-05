/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { Chart, Table } from '@tupaia/ui-components/lib/chart';
import { useDashboardReportData } from '../api/queries';
import { FetchLoader } from './FetchLoader';

const Wrapper = styled.div`
  flex: 1;
  display: flex;
`;

const ChartWrapper = styled(Wrapper)`
  padding: 1.25rem 1.875rem 0;

  .MuiAlert-root {
    position: relative;
    top: -0.625rem; // offset the chart wrapper padding
  }
`;

export const TABS = {
  CHART: 'chart',
  TABLE: 'table',
};

export const ChartTable = ({
  entityCode,
  dashboardGroupId,
  reportId,
  periodGranularity,
  year,
  selectedTab,
}) => {
  const { data: viewContent, isLoading, isError, error } = useDashboardReportData({
    entityCode,
    dashboardGroupId,
    reportId,
    periodGranularity,
    year,
  });

  return (
    <FetchLoader isLoading={isLoading} isError={isError} error={error}>
      {selectedTab === TABS.CHART ? (
        <ChartWrapper>
          <Chart viewContent={viewContent} />
        </ChartWrapper>
      ) : (
        <Wrapper>
          <Table viewContent={viewContent} />
        </Wrapper>
      )}
    </FetchLoader>
  );
};

ChartTable.propTypes = {
  reportId: PropTypes.string.isRequired,
  entityCode: PropTypes.string.isRequired,
  year: PropTypes.string,
  dashboardGroupId: PropTypes.string.isRequired,
  periodGranularity: PropTypes.string,
  selectedTab: PropTypes.string,
};

ChartTable.defaultProps = {
  year: null,
  selectedTab: TABS.CHART,
  periodGranularity: null,
};
