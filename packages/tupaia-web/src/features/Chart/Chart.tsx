/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { Chart as ChartComponent, ViewContent } from '@tupaia/ui-chart-components';

const Wrapper = styled.div`
  display: flex;
  position: relative;
  flex: 1 1 100%;
  align-content: stretch;
  -webkit-box-align: stretch;
  align-items: stretch;
  flex-direction: column;
  min-height: 12rem;
  position: relative;
  .recharts-responsive-container {
    min-width: 0px;
  }
`;

interface ChartProps {
  viewContent: ViewContent;
  isEnlarged?: boolean;
}

export const Chart = ({ viewContent, isEnlarged = false }: ChartProps) => {
  return (
    <Wrapper>
      <ChartComponent viewContent={viewContent} isEnlarged={isEnlarged} isExporting={false} />
    </Wrapper>
  );
};
