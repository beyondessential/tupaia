/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import { ListVisual } from '../../src';
import viewContent from './data/listVisualViewContent.json';

export default {
  title: 'Chart/ListVisual',
  component: ListVisual,
};

const Container = styled.div`
  width: 750px;
  overflow: auto;
  margin-bottom: 2rem;
  padding: 3rem;
`;

const ChartContainer = styled.div`
  border: 1px solid #dedee0;
  border-radius: 3px;
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

// eslint-disable-next-line react/prop-types
const DrillDownComponent = ({ ButtonComponent, viewConfig }) => {
  const handleClick = () => {
    alert(JSON.stringify(viewConfig, 1));
  };
  return <ButtonComponent onClick={handleClick} />;
};

const drillDowns = [
  {
    code: 'LESMIS_enrolment_ece_0_2_target',
    reportCode: 'LESMIS_enrolment_ece_0_2_target',
    name: 'Enrolment rate of 0-2 year old students in ECE',
  },
  {
    code: 'LESMIS_enrolment_ece_3_4_target',
    reportCode: 'LESMIS_enrolment_ece_3_4_target',
    name: 'Enrolment rate of 3-4 year old students in ECE',
  },
  {
    code: 'LESMIS_enrolment_ece_5_target',
    reportCode: 'LESMIS_enrolment_ece_5_target',
    name: 'Enrolment rate of 5 year old students in ECE',
  },
];

export const LightTheme = Template.bind({});
LightTheme.args = {
  viewContent,
  DrillDownComponent,
  drillDowns,
  dashboard: {
    dashboardCode: 'LESMIS_ESSDP_EarlyChildhoodSubSector_Schools',
    dashboardName: 'Schools',
  },
};
