/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React, { useState } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import BarChartIcon from '@material-ui/icons/BarChart';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import GridOnIcon from '@material-ui/icons/GridOn';
import { Chart, Table } from '@tupaia/ui-components/lib/chart';
import { useDashboardReportData } from '../api';
import { FetchLoader } from './FetchLoader';
import { FlexSpaceBetween } from './Layout';
import { ToggleButton } from './ToggleButton';
import { DashboardReportModal } from './DashboardReportModal';
import * as COLORS from '../constants';

const Container = styled.div`
  width: 55rem;
  max-width: 100%;
  border: 1px solid ${props => props.theme.palette.grey['400']};
  margin-bottom: 1.8rem;
  border-radius: 3px;
`;

const Header = styled(FlexSpaceBetween)`
  padding: 1.25rem 1.875rem;
  border-bottom: 1px solid ${props => props.theme.palette.grey['400']};
`;

const Title = styled(Typography)`
  font-style: normal;
  font-weight: 500;
  font-size: 1.125rem;
  line-height: 1.3rem;
`;

const Body = styled.div`
  display: flex;
  background: ${COLORS.GREY_F9};
  min-height: 26rem;
  max-height: 40rem;

  .MuiTable-root {
    min-height: 100%;
  }
`;

const ChartWrapper = styled.div`
  display: flex;
  //height: 26rem;
  padding: 1.25rem 1.875rem 0;
  width: 100%;

  .MuiAlert-root {
    position: relative;
    top: -0.625rem; // offset the chart wrapper padding
  }
`;

const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 1.25rem 1.875rem;
  background: ${COLORS.GREY_F9};
  border-top: 1px solid ${props => props.theme.palette.grey['400']};
`;

export const CHART_TYPES = {
  AREA: 'area',
  BAR: 'bar',
  COMPOSED: 'composed',
  LINE: 'line',
  PIE: 'pie',
};

export const TABS = {
  CHART: 'chart',
  TABLE: 'table',
};

export const Report = React.memo(
  ({
    reportId,
    name,
    entityCode,
    dashboardGroupId,
    periodGranularity,
    defaultTimePeriod,
    onItemClick,
    year,
  }) => {
    const [selectedTab, setSelectedTab] = useState(TABS.CHART);
    const { data: viewContent, isLoading, isError, error } = useDashboardReportData({
      entityCode,
      dashboardGroupId,
      reportId,
      periodGranularity,
      year,
      defaultTimePeriod,
    });

    const handleTabChange = (event, newValue) => {
      if (newValue !== null) {
        setSelectedTab(newValue);
      }
    };

    const ReportComponent = () => (
      <FetchLoader isLoading={isLoading} isError={isError} error={error}>
        {selectedTab === TABS.CHART ? (
          <ChartWrapper>
            <Chart viewContent={viewContent} onItemClick={onItemClick} isEnlarged />
          </ChartWrapper>
        ) : (
          <Table viewContent={viewContent} />
        )}
      </FetchLoader>
    );

    return (
      <Container>
        <Header>
          <Title>{name}</Title>
          <ToggleButtonGroup onChange={handleTabChange} value={selectedTab} exclusive>
            <ToggleButton value={TABS.TABLE}>
              <GridOnIcon />
            </ToggleButton>
            <ToggleButton value={TABS.CHART}>
              <BarChartIcon />
            </ToggleButton>
          </ToggleButtonGroup>
        </Header>
        <Body>
          <ReportComponent />
        </Body>
        <Footer>
          <DashboardReportModal buttonText="More Insights">
            <ReportComponent />
          </DashboardReportModal>
        </Footer>
      </Container>
    );
  },
);

Report.propTypes = {
  name: PropTypes.string.isRequired,
  reportId: PropTypes.string.isRequired,
  entityCode: PropTypes.string.isRequired,
  year: PropTypes.string,
  dashboardGroupId: PropTypes.string.isRequired,
  periodGranularity: PropTypes.string,
  defaultTimePeriod: PropTypes.object,
  onItemClick: PropTypes.func,
};

Report.defaultProps = {
  defaultTimePeriod: null,
  year: null,
  periodGranularity: null,
  onItemClick: () => {},
};
