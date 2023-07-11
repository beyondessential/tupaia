/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { Chart as ChartComponent, ViewContent } from '@tupaia/ui-chart-components';
import { DashboardItemDisplayProps } from '../types';

const Wrapper = styled.div<{
  $isEnlarged: boolean;
  $hasData: boolean;
}>`
  display: flex;
  position: relative;
  align-content: stretch;
  -webkit-box-align: stretch;
  align-items: stretch;
  height: ${({ $isEnlarged, $hasData }) => {
    if (!$hasData) return 'auto';
    return $isEnlarged ? '22.5rem' : '14rem';
  }};
  flex-direction: column;
  .recharts-responsive-container {
    min-width: 0px;
  }
  .recharts-wrapper {
    font-size: 1rem !important; // this is to make sure the labels on the charts are relative to the base font size
  }
  // Make the charts conform to the parent container's size
  .recharts-wrapper,
  .recharts-wrapper svg {
    height: 100% !important;
    width: ${({ $isEnlarged }) =>
      $isEnlarged
        ? '100%'
        : '95%'} !important; // some charts end up overflowing the space in the dashboard, if the content is too large. This makes up for it.
  }
  li.recharts-legend-item {
    white-space: nowrap; // ensure there are no line breaks on the export legends
  }
`;

export const Chart = ({ viewContent, isEnlarged = false }: DashboardItemDisplayProps) => {
  const hasData = viewContent.data && viewContent.data.length > 0 ? true : false;
  return (
    <Wrapper $isEnlarged={isEnlarged} $hasData={hasData}>
      <ChartComponent viewContent={viewContent} isEnlarged={isEnlarged} isExporting={false} />
    </Wrapper>
  );
};
