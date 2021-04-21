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
import GridOnIcon from '@material-ui/icons/GridOn';
import { Chart } from '@tupaia/ui-components/lib/chart';
import { useViewData } from '../api';
import { FetchLoader } from './FetchLoader';
import { FlexSpaceBetween } from './Layout';
import { ToggleButton, ToggleButtonGroup } from './ToggleButton';
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

const Inner = styled.div`
  display: flex;
  padding: 1.25rem 1.875rem 0;
  background: ${COLORS.GREY_F9};
  height: 26rem;
  min-height: 21rem;
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
}) => {
  const [value, setValue] = useState('chart');
  const { data: viewContent, isLoading, isError, error } = useViewData({
    entityCode,
    dashboardGroupId,
    reportId,
    periodGranularity,
    defaultTimePeriod,
  });

  const handleChange = (event, newValue) => {
    if (newValue !== null) {
      setValue(newValue);
    }
  };

  return (
    <Container>
      <Header>
        <Title>{name}</Title>
        <ToggleButtonGroup onChange={handleChange} value={value} exclusive>
          <ToggleButton value="table">
            <GridOnIcon />
          </ToggleButton>
          <ToggleButton value="chart">
            <BarChartIcon />
          </ToggleButton>
        </ToggleButtonGroup>
      </Header>
      <Inner>
        {value === 'chart' ? (
          <FetchLoader isLoading={isLoading} isError={isError} error={error}>
            <Chart viewContent={viewContent} onItemClick={onItemClick} isEnlarged />
          </FetchLoader>
        ) : (
          <div>Table</div>
        )}
      </Inner>
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
  dashboardGroupId: PropTypes.string.isRequired,
  periodGranularity: PropTypes.string,
  defaultTimePeriod: PropTypes.object,
  onItemClick: PropTypes.func,
};

Report.defaultProps = {
  defaultTimePeriod: null,
  periodGranularity: null,
  onItemClick: null,
};
