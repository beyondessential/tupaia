/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React, { useState } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';
import BarChartIcon from '@material-ui/icons/BarChart';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import GridOnIcon from '@material-ui/icons/GridOn';
import { Chart, Table } from '@tupaia/ui-components/lib/chart';
import { useDashboardReportData } from '../api';
import { FetchLoader } from './FetchLoader';
import { FlexSpaceBetween } from './Layout';
import { ToggleButton } from './ToggleButton';
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
  min-height: 21rem;
  max-height: 40rem;

  .MuiTable-root {
    min-height: 100%;
  }
`;

const ChartWrapper = styled.div`
  display: flex;
  height: 26rem;
  padding: 1.25rem 1.875rem 0;
  width: 100%;
`;

const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 1.25rem 1.875rem;
  background: ${COLORS.GREY_F9};
  border-top: 1px solid ${props => props.theme.palette.grey['400']};
`;

export const Report = ({
  reportId,
  name,
  entityCode,
  dashboardGroupId,
  periodGranularity,
  defaultTimePeriod,
  onItemClick,
  year,
}) => {
  const [value, setValue] = useState('chart');
  const { data: viewContent, isLoading, isError, error } = useDashboardReportData({
    entityCode,
    dashboardGroupId,
    reportId,
    periodGranularity,
    year,
    defaultTimePeriod,
  });

  const handleChange = (event, newValue) => {
    if (newValue !== null) {
      setValue(newValue);
    }
  };

  const chartType = viewContent?.chartType;

  return (
    <Container>
      <Header>
        <Title>{name}</Title>
        {chartType !== 'pie' && (
          <ToggleButtonGroup onChange={handleChange} value={value} exclusive>
            <ToggleButton value="table">
              <GridOnIcon />
            </ToggleButton>
            <ToggleButton value="chart">
              <BarChartIcon />
            </ToggleButton>
          </ToggleButtonGroup>
        )}
      </Header>
      <Body>
        {chartType !== 'pie' && value === 'table' ? (
          <Table viewContent={viewContent} />
        ) : (
          <FetchLoader isLoading={isLoading} isError={isError} error={error}>
            <ChartWrapper>
              <Chart viewContent={viewContent} onItemClick={onItemClick} isEnlarged />
            </ChartWrapper>
          </FetchLoader>
        )}
      </Body>
      <Footer>
        <Button endIcon={<KeyboardArrowRightIcon />} color="primary">
          More Insights
        </Button>
      </Footer>
    </Container>
  );
};

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
  onItemClick: null,
};
