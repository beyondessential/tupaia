/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import { ListVisual } from '../../src';
import viewContent from './data/listVisualViewContent.json';
import { RouterProvider } from '../../helpers/RouterProvider';

export default {
  title: 'Chart/ListVisual',
  component: ListVisual,
  decorators: [story => <RouterProvider>{story()}</RouterProvider>],
};

const Container = styled.div`
  width: 750px;
  overflow: auto;
  margin-bottom: 2rem;
  padding: 3rem;
`;

const Template = args => {
  return (
    <Container>
      <ListVisual {...args} />
    </Container>
  );
};

const reportCodes = {
  LESMIS_enrolment_ece_0_2_target: 'LESMIS_enrolment_ece_0_2_target',
  LESMIS_enrolment_ece_3_4_target: 'LESMIS_enrolment_ece_3_4_target',
  LESMIS_enrolment_ece_5_target: 'LESMIS_enrolment_ece_5_target',
};

export const LightTheme = Template.bind({});
LightTheme.args = {
  viewContent,
  reportCodes,
  drilldownPathname: `/LA_Huoixai%20District/dashboard`,
  isEnlarged: true,
};
