/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React from 'react';
import styled from 'styled-components';
import { Chart, Table } from '../../src/components/Chart';

const LightContainer = styled.div`
  //padding: 3rem 4rem;
  width: 750px;
  //height: 600px;
  background: #f9f9f9;
  border-radius: 3px;
  border: 1px solid #dedee0;
`;

export const LightThemeChartTemplate = args => (
  <LightContainer>
    {/*<Chart {...args} />*/}
    <Table {...args} />
  </LightContainer>
);

const DarkContainer = styled(LightContainer)`
  background: #262834;
  border: 1px solid #262834;
`;

export const DarkThemeTemplate = args => (
  <DarkContainer>
    <Chart {...args} />
  </DarkContainer>
);
