/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { Chart as ChartComponent } from '@tupaia/ui-chart-components';
import { DashboardItemType } from '../../types';

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
  viewContent: DashboardItemType & {
    data: Record<string, unknown>[];
    periodGranularity: any;
  };
}

export const Chart = ({ viewContent }: ChartProps) => {
  return (
    <Wrapper>
      <ChartComponent viewContent={viewContent} isEnlarged={false} isExporting={false} />
    </Wrapper>
  );
};
