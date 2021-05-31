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
import { FlexSpaceBetween } from './Layout';
import { ToggleButton } from './ToggleButton';
import { DashboardReportModal } from './DashboardReportModal';
import { ChartTable, TABS } from './ChartTable';
import * as COLORS from '../constants';
import { useDashboardReportData } from '../api/queries';
import { yearToApiDates } from '../api/queries/utils';

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
  padding-top: 1rem;

  .MuiTable-root {
    min-height: 100%;
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

export const Report = React.memo(
  ({
    reportId,
    name,
    entityCode,
    dashboardGroupId,
    dashboardGroupName,
    periodGranularity,
    year,
  }) => {
    const [selectedTab, setSelectedTab] = useState(TABS.CHART);
    const { startDate, endDate } = yearToApiDates(year);
    const { data: viewContent, isLoading, isError, error } = useDashboardReportData({
      entityCode,
      dashboardGroupId,
      reportId,
      periodGranularity,
      startDate,
      endDate,
    });

    const handleTabChange = (event, newValue) => {
      if (newValue !== null) {
        setSelectedTab(newValue);
      }
    };

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
          <ChartTable
            viewContent={viewContent}
            isLoading={isLoading}
            isError={isError}
            error={error}
            selectedTab={selectedTab}
          />
        </Body>
        <Footer>
          <DashboardReportModal
            buttonText="See More"
            name={name}
            dashboardGroupName={dashboardGroupName}
            entityCode={entityCode}
            dashboardGroupId={dashboardGroupId}
            reportId={reportId}
            periodGranularity={periodGranularity}
          />
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
  dashboardGroupName: PropTypes.string.isRequired,
  periodGranularity: PropTypes.string,
};

Report.defaultProps = {
  year: null,
  periodGranularity: null,
};
