/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import styled from 'styled-components';
import { Chart } from '../../src';

const Container = styled.div`
  margin: 1rem auto;
  width: 600px;
  height: 400px;
`;

const queryClient = new QueryClient();

export default {
  title: 'Chart',
  component: Chart,
  decorators: [
    Story => (
      <Container>
        <QueryClientProvider client={queryClient}>
          <Story />
        </QueryClientProvider>
      </Container>
    ),
  ],
};

const Template = args => <Chart {...args} />;

export const ExploreView29 = Template.bind({});
ExploreView29.args = {
  projectCode: 'explore',
  organisationUnitCode: 'explore',
  dashboardGroupId: '301',
  viewId: '29',
};

export const ExploreView28 = Template.bind({});
ExploreView28.args = {
  projectCode: 'explore',
  organisationUnitCode: 'explore',
  dashboardGroupId: '301',
  viewId: '28',
};

export const ExploreView8 = Template.bind({});
ExploreView8.args = {
  projectCode: 'explore',
  organisationUnitCode: 'explore',
  dashboardGroupId: '301',
  viewId: '8',
};
