/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React from 'react';
import styled from 'styled-components';
import { Chart, Table } from '../../src/components/Chart';

const LightContainer = styled.div`
  width: 750px;
  background: #f9f9f9;
  border-radius: 3px;
  border: 1px solid #dedee0;
  max-height: 510px;
  overflow: auto;
  margin-bottom: 2rem;
`;

const ChartContainer = styled.div`
  padding: 3rem 3rem 3rem 1rem;
  height: 500px;
`;

export const LightThemeChartTemplate = args => (
  <>
    <LightContainer>
      <ChartContainer>
        <Chart {...args} />
      </ChartContainer>
    </LightContainer>
    <LightContainer>
      <Table {...args} />
    </LightContainer>
  </>
);

const DarkContainer = styled(LightContainer)`
  background: #262834;
  border: 1px solid #262834;
`;

export const DarkThemeTemplate = args => (
  <>
    <DarkContainer>
      <ChartContainer>
        <Chart {...args} />
      </ChartContainer>
    </DarkContainer>
    <DarkContainer>
      <Table {...args} />
    </DarkContainer>
  </>
);
