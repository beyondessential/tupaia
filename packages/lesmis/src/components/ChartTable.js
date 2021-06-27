/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { Chart, Table } from '@tupaia/ui-components/lib/chart';
import { FetchLoader } from './FetchLoader';

const Wrapper = styled.div`
  display: flex;
  flex: 1;
  overflow: auto;
`;

const ChartWrapper = styled.div`
  display: flex;
  flex: 1;
  padding: 0.25rem 1.875rem 0;

  .MuiAlert-root {
    position: relative;
    top: -0.15rem; // offset the chart wrapper padding
  }
`;

export const TABS = {
  CHART: 'chart',
  TABLE: 'table',
};

export const ChartTable = ({ isLoading, isError, error, viewContent, selectedTab }) => (
  <FetchLoader isLoading={isLoading} isError={isError} error={error}>
    {selectedTab === TABS.CHART ? (
      <ChartWrapper>
        <Chart viewContent={viewContent} legendPosition="top" />
      </ChartWrapper>
    ) : (
      <Wrapper>
        <Table viewContent={viewContent} />
      </Wrapper>
    )}
  </FetchLoader>
);

ChartTable.propTypes = {
  viewContent: PropTypes.object,
  isLoading: PropTypes.bool,
  isError: PropTypes.bool,
  error: PropTypes.string,
  selectedTab: PropTypes.string,
};

ChartTable.defaultProps = {
  viewContent: null,
  isLoading: false,
  isError: false,
  error: null,
  selectedTab: TABS.CHART,
};
