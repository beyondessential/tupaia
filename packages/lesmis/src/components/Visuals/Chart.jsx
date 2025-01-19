import React, { useState } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import BarChartIcon from '@material-ui/icons/BarChart';
import GridOnIcon from '@material-ui/icons/GridOn';
import {
  Chart as ChartComponent,
  ChartTable as BaseChartTable,
  getIsChartData,
} from '@tupaia/ui-chart-components';
import { FetchLoader } from '../FetchLoader';
import { FlexStart, FlexEnd, FlexColumn } from '../Layout';
import { ToggleButton } from '../ToggleButton';
import { VisualHeader } from './VisualHeader';
import * as COLORS from '../../constants';
import { FavouriteButton } from '../FavouriteButton';
import { YearLabel } from '../YearLabel';

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
  report,
  config,
  exportOptions,
  isLoading,
  isError,
  error,
  selectedTab,
  isExporting,
}) => {
  const newConfig = {
    ...config,
    presentationOptions: {
      ...config?.presentationOptions,
      ...exportOptions,
    },
  };

  if (isExporting) {
    return (
      <ExportContainer>
        <ChartComponent
          report={report}
          config={newConfig}
          legendPosition="top"
          isExporting={isExporting}
        />
        {exportOptions?.exportWithTable && (
          <FlexStart my={5}>
            <BaseChartTable config={config} report={report} />
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
            report={report}
            config={newConfig}
            legendPosition="top"
            isExporting={isExporting}
          />
        </ChartWrapper>
      ) : (
        <Wrapper>
          <BaseChartTable config={config} report={report} />
        </Wrapper>
      )}
    </FetchLoader>
  );
};

export const Chart = ({
  name,
  exportOptions,
  report,
  config,
  isLoading,
  isFetching,
  isError,
  error,
  isEnlarged,
  isExporting,
  isFavourite,
  handleFavouriteStatusChange,
  useYearSelector,
}) => {
  const [selectedTab, setSelectedTab] = useState(TABS.CHART);

  const handleTabChange = (event, newValue) => {
    if (newValue !== null) {
      setSelectedTab(newValue);
    }
  };

  // loading whole chart (i.e. show full loading spinner) if first load, or fetching in background
  // from a no data state
  const isLoadingWholeChart =
    isLoading || (!getIsChartData(config?.chartType, report) && isFetching);
  const isFetchingInBackground = isFetching && !isLoadingWholeChart;

  return isEnlarged ? (
    <>
      {!isExporting && (
        <FlexEnd>
          <Toggle onChange={handleTabChange} value={selectedTab} exclusive />
        </FlexEnd>
      )}
      <ChartTable
        report={report}
        config={config}
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
        <YearLabel useYearSelector={useYearSelector} />
        <Toggle onChange={handleTabChange} value={selectedTab} exclusive />
        <FavouriteButton
          isFavourite={isFavourite}
          handleFavouriteStatusChange={handleFavouriteStatusChange}
        />
      </VisualHeader>
      <Body>
        <ChartTable
          report={report}
          config={config}
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
  report: PropTypes.object,
  config: PropTypes.object,
  exportOptions: PropTypes.object,
  isLoading: PropTypes.bool,
  isFetching: PropTypes.bool,
  isEnlarged: PropTypes.bool,
  isExporting: PropTypes.bool,
  isError: PropTypes.bool,
  useYearSelector: PropTypes.bool,
  error: PropTypes.string,
  name: PropTypes.string,
};

Chart.defaultProps = {
  report: null,
  config: null,
  exportOptions: null,
  isLoading: false,
  isFetching: false,
  isEnlarged: false,
  isExporting: false,
  isError: false,
  useYearSelector: false,
  error: null,
  name: null,
};
