/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { Chart as ChartComponent, ViewContent } from '@tupaia/ui-chart-components';

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
  // Make the charts conform to the parent container's size
  .recharts-wrapper,
  .recharts-wrapper svg {
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
  const hasData = viewContent.data && viewContent.data.length > 0 ? true : false;
  return (
    <Wrapper $isEnlarged={isEnlarged} $hasData={hasData}>
      <ChartComponent viewContent={viewContent} isEnlarged={isEnlarged} isExporting={false} />
    </Wrapper>
  );
};
