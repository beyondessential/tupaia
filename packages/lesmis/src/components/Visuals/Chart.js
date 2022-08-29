/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React, { useState } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import BarChartIcon from '@material-ui/icons/BarChart';
import GridOnIcon from '@material-ui/icons/GridOn';
import FavoriteBorderIcon from '@material-ui/icons/FavoriteBorder';
import IconButton from '@material-ui/core/IconButton';

import {
  Chart as ChartComponent,
  ChartTable as BaseChartTable,
  FlexCenter,
  getIsChartData,
} from '@tupaia/ui-components';
import { FetchLoader } from '../FetchLoader';
import { FlexStart, FlexEnd, FlexColumn } from '../Layout';
import { ToggleButton } from '../ToggleButton';
import { VisualHeader } from './VisualHeader';
import * as COLORS from '../../constants';

const Wrapper = styled.div`
  flex: 1;
  display: flex;
  overflow: auto;
`;

const ExportContainer = styled(FlexColumn)`
  justify-content: flex-start;

  .recharts-surface {
    overflow: visible;
  }
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

/* eslint-disable react/prop-types */
const ChartTable = ({
  viewContent,
  exportOptions,
  isLoading,
  isError,
  error,
  selectedTab,
  isExporting,
}) => {
  const newViewContent = {
    ...viewContent,
    presentationOptions: {
      ...viewContent?.presentationOptions,
      ...exportOptions,
    },
  };

  if (isExporting) {
    return (
      <ExportContainer>
        <ChartComponent
          viewContent={newViewContent}
          legendPosition="top"
          isExporting={isExporting}
        />
        {exportOptions?.exportWithTable && (
          <FlexStart my={5}>
            <BaseChartTable viewContent={viewContent} />
          </FlexStart>
        )}
      </ExportContainer>
    );
  }

  return (
    <FetchLoader isLoading={isLoading} isError={isError} error={error}>
      {selectedTab === TABS.CHART ? (
        <ChartWrapper>
          <ChartComponent
            viewContent={newViewContent}
            legendPosition="top"
            isExporting={isExporting}
          />
        </ChartWrapper>
      ) : (
        <Wrapper>
          <BaseChartTable viewContent={viewContent} />
        </Wrapper>
      )}
    </FetchLoader>
  );
};

export const Chart = ({
  name,
  exportOptions,
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
        selectedTab={isExporting ? TABS.CHART : selectedTab}
        isExporting={isExporting}
        exportOptions={exportOptions}
      />
    </>
  ) : (
    <>
      <VisualHeader name={name} isLoading={isFetchingInBackground}>
        <FlexCenter>
          <Toggle onChange={handleTabChange} value={selectedTab} exclusive />
          <IconButton
            style={{ marginLeft: '17px' }}
            disableRipple
            size="small"
            aria-label="favourite-icon"
          >
            <FavoriteBorderIcon />
          </IconButton>
        </FlexCenter>
      </VisualHeader>
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
  exportOptions: PropTypes.object,
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
  exportOptions: null,
  isLoading: false,
  isFetching: false,
  isEnlarged: false,
  isExporting: false,
  isError: false,
  error: null,
  name: null,
};
