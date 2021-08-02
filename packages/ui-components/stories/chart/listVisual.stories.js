/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import { ListVisual } from '../../src/components/ListVisual';
import data from './data/list.json';
import config from './data/listDashboard.json';

export default {
  title: 'Chart/ListVisual',
  component: ListVisual,
};

const Container = styled.div`
  width: 750px;
  overflow: auto;
  margin-bottom: 2rem;
`;

const ChartContainer = styled.div`
  padding: 3rem 3rem 3rem 1rem;
`;

const Template = args => {
  return (
    <Container>
      <ChartContainer>
        <ListVisual {...args} />
      </ChartContainer>
    </Container>
  );
};

export const LightTheme = Template.bind({});
LightTheme.args = {
  config,
  data,
};
