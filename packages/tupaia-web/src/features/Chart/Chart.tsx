/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { Chart as ChartComponent, ViewContent } from '@tupaia/ui-chart-components';

const Wrapper = styled.div<{
  $isEnlarged: boolean;
}>`
  display: flex;
  position: relative;
  align-content: stretch;
  -webkit-box-align: stretch;
  align-items: stretch;
  height: ${({ $isEnlarged }) => ($isEnlarged ? '22.5rem' : '12rem')};
  position: relative;
  flex-direction: column;
  .recharts-responsive-container {
    min-width: 0px;
  }
  .recharts-wrapper,
  svg {
    height: 100% !important;
    width: 100%;
  }
  li.recharts-legend-item {
    white-space: nowrap; // ensure there are no line breaks on the export legends
  }
`;

interface ChartProps {
  viewContent: ViewContent;
  isEnlarged?: boolean;
}

export const Chart = ({ viewContent, isEnlarged = false }: ChartProps) => {
  return (
    <Wrapper $isEnlarged={isEnlarged}>
      <ChartComponent viewContent={viewContent} isEnlarged={isEnlarged} isExporting={false} />
    </Wrapper>
  );
};
