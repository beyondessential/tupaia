/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { Chart } from '@tupaia/ui-components/lib/chart';
import { VIEW_CONTENT_SHAPE } from './propTypes';
import { ChartContainer, ChartViewContainer } from './Layout';

const CustomChartContainer = styled(ChartContainer)`
  // recharts components doesn't pass nested styles so they need to be added on a wrapping component
  li.recharts-legend-item {
    white-space: nowrap; // ensure there are no line breaks on the export legends
  }
`;

export const ChartWrapper = ({ viewContent, isEnlarged, isExporting, onItemClick }) => {
  return (
    <ChartViewContainer>
      <CustomChartContainer>
        <Chart
          isEnlarged={isEnlarged}
          isExporting={isExporting}
          viewContent={viewContent}
          onItemClick={onItemClick}
        />
      </CustomChartContainer>
    </ChartViewContainer>
  );
};

ChartWrapper.propTypes = {
  viewContent: PropTypes.shape(VIEW_CONTENT_SHAPE),
  isEnlarged: PropTypes.bool,
  isExporting: PropTypes.bool,
  onItemClick: PropTypes.func,
};

ChartWrapper.defaultProps = {
  viewContent: null,
  isEnlarged: false,
  isExporting: false,
  onItemClick: () => {},
};
