/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React, { useState } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import BarChartIcon from '@material-ui/icons/BarChart';
import GridOnIcon from '@material-ui/icons/GridOn';
import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';
import { Chart as ChartComponent, Table, getIsChartData } from '@tupaia/ui-components/lib/chart';
import { FetchLoader } from './FetchLoader';
import { FlexEnd, FlexStart, FlexSpaceBetween } from './Layout';
import { ToggleButton } from './ToggleButton';
import * as COLORS from '../constants';

const Wrapper = styled.div`
  flex: 1;
  display: flex;
  overflow: auto;
`;

const ChartWrapper = styled(Wrapper)`
  padding: 0.25rem 1.875rem 0;

  .recharts-surface {
    overflow: visible;
  }

  .MuiAlert-root {
    position: relative;
    top: -0.15rem; // offset the chart wrapper padding
  }
`;

const Header = styled(FlexSpaceBetween)`
  padding: 1.25rem 1.875rem;
  border-bottom: 1px solid ${props => props.theme.palette.grey['400']};
`;

const Body = styled.div`
  display: flex;
  background: ${COLORS.GREY_F9};
  min-height: 26rem;
  max-height: 40rem;
  padding-top: 1rem;

  .MuiTable-root {
    min-height: 100%;
  }
`;

const Title = styled(Typography)`
  font-style: normal;
  font-weight: 500;
  font-size: 1.125rem;
  line-height: 1.3rem;
  margin-right: 1rem;
`;

export const TABS = {
  CHART: 'chart',
  TABLE: 'table',
};

// eslint-disable-next-line react/prop-types
const Toggle = ({ value, onChange }) => (
  <ToggleButtonGroup value={value} onChange={onChange} exclusive>
    <ToggleButton value={TABS.TABLE}>
      <GridOnIcon />
    </ToggleButton>
    <ToggleButton value={TABS.CHART}>
      <BarChartIcon />
    </ToggleButton>
  </ToggleButtonGroup>
);

// eslint-disable-next-line react/prop-types
const ChartTable = ({ viewContent, isLoading, isError, error, selectedTab, isExporting }) => {
  return (
    <FetchLoader isLoading={isLoading} isError={isError} error={error}>
      {selectedTab === TABS.CHART ? (
        <ChartWrapper>
          <ChartComponent
            viewContent={viewContent}
            legendPosition="top"
            isExporting={isExporting}
          />
        </ChartWrapper>
      ) : (
        <Wrapper>
          <Table viewContent={viewContent} />
        </Wrapper>
      )}
    </FetchLoader>
  );
};

export const Chart = ({
  name,
  viewContent,
  isLoading,
  isFetching,
  isError,
  error,
  isEnlarged,
  isExporting,
}) => {
  const [selectedTab, setSelectedTab] = useState(TABS.CHART);

  const handleTabChange = (event, newValue) => {
    if (newValue !== null) {
      setSelectedTab(newValue);
    }
  };

  // loading whole chart (i.e. show full loading spinner) if first load, or fetching in background
  // from a no data state
  const isLoadingWholeChart = isLoading || (!getIsChartData(viewContent) && isFetching);
  const isFetchingInBackground = isFetching && !isLoadingWholeChart;

  return isEnlarged ? (
    <>
      {!isExporting && (
        <FlexEnd>
          <Toggle onChange={handleTabChange} value={selectedTab} exclusive />
        </FlexEnd>
      )}
      <ChartTable
        viewContent={viewContent}
        isLoading={isLoading}
        isError={isError}
        error={error}
        selectedTab={selectedTab}
        isExporting={isExporting}
      />
    </>
  ) : (
    <>
      <Header>
        <FlexStart>
          <Title>{name}</Title>
          {isFetchingInBackground && <CircularProgress size={30} />}
        </FlexStart>
        <Toggle onChange={handleTabChange} value={selectedTab} exclusive />
      </Header>
      <Body>
        <ChartTable
          viewContent={viewContent}
          isLoading={isLoadingWholeChart}
          isError={isError}
          error={error}
          selectedTab={selectedTab}
          isExporting={isExporting}
        />
      </Body>
    </>
  );
};

Chart.propTypes = {
  viewContent: PropTypes.object,
  isLoading: PropTypes.bool,
  isFetching: PropTypes.bool,
  isEnlarged: PropTypes.bool,
  isExporting: PropTypes.bool,
  isError: PropTypes.bool,
  error: PropTypes.string,
  name: PropTypes.string,
};

Chart.defaultProps = {
  viewContent: null,
  isLoading: false,
  isFetching: false,
  isEnlarged: false,
  isExporting: false,
  isError: false,
  error: null,
  name: null,
};
