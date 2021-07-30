/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React, { useState } from 'react';
import styled from 'styled-components';
import Typography from '@material-ui/core/Typography';
import { Link as RouterLink } from 'react-router-dom';
import { Home, ImportContacts, ContactMail, Close, Menu, Assignment } from '@material-ui/icons';
import { LightIconButton } from '@tupaia/ui-components';
import { FlexStart, FlexSpaceBetween } from './Layout';
import { DashboardReportModal } from './DashboardReportModal';

const data = [
  {
    heading:
      'Intermediate Outcomes 1: Increased access to quality ECE (Part IHL01, I0s 1.2 and 1.3)',
    color: 'yellow',
    data: [
      {
        heading:
          'Improved and more inclusive curricula is implemented at all levels of school education',
        color: 'yellow',
      },
      {
        heading: 'Improved student learning outcomes measurement at G3, G5, M4 and M7 ',
        color: 'green',
      },
      {
        heading:
          'Increased intake and progression rates at all levels leading to increasing graduation rates',
        color: 'green',
      },
      {
        heading: 'Promote extension of vocational classroom training at upper secondary school',
        color: 'yellow',
      },
      {
        heading:
          'Reduced gap in education performance between disadvantaged and non-disadvantaged areas through establishing school clusters',
        color: 'red',
      },
      {
        heading: 'Promote extension of vocational classroom training at upper secondary school',
        color: 'yellow',
      },
      {
        heading:
          'Reduced gap in education performance between disadvantaged and non-disadvantaged areas through establishing school clusters',
        color: 'yellow',
      },
      {
        heading:
          'TARGET: Perc. primary entrants who have attended ECE – 2025 target national 75%, 40 districts 63.9%',
        color: 'yellow',
      },
      {
        heading:
          'TARGET: GIR into last grade of primary education – 2025 target national 100%, 40 districts 100%',
        color: 'yellow',
      },
    ],
  },
  {
    heading:
      'Intermediate Outcomes 2: Increased access to quality ECE (Part IHL01, I0s 1.2 and 1.3)',
    color: 'yellow',
    data: [
      {
        heading:
          'Improved and more inclusive curricula is implemented at all levels of school education',
        color: 'yellow',
      },
      {
        heading: 'Improved student learning outcomes measurement at G3, G5, M4 and M7 ',
        color: 'yellow',
      },
      {
        heading:
          'Increased intake and progression rates at all levels leading to increasing graduation rates',
        color: 'yellow',
      },
    ],
  },
];

const Container = styled.div`
  border: 1px solid ${props => props.theme.palette.grey['400']};
  border-radius: 3px;
`;

const Header = styled(FlexStart)`
  padding: 2rem 1rem;
  border-bottom: 1px solid ${props => props.theme.palette.grey['400']};
`;

const Body = styled.div`
  position: relative;
`;

const Row = styled(FlexSpaceBetween)`
  background: #f9f9f9;
  border-bottom: 1px solid ${props => props.theme.palette.grey['400']};

  &:nth-child(even) {
    background: #f1f1f1;
  }
`;

const Cell = styled.div`
  padding: 1rem;
  border-right: 1px solid ${props => props.theme.palette.grey['400']};
  flex: 1;
`;

const CircleCell = styled.div`
  display: flex;
  justify-content: center;
  width: 115px;
  padding: 0;
  border-right: none;
`;

const Heading = styled(Typography)`
  font-weight: 500;
  font-size: 18px;
  line-height: 26px;
`;

const Text = styled(Typography)`
  font-size: 14px;
  line-height: 16px;
`;

const COLORS = {
  yellow: {
    inner: '#ffc701',
    outer: '#ffe600',
  },
  green: {
    inner: '#02B851',
    outer: '#99EABC',
  },
  red: {
    inner: '#D13333',
    outer: '#FF9393',
  },
};

const Circle = styled.div`
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: ${props => COLORS[props.color].inner};
  border: 5px solid ${props => COLORS[props.color].outer};
`;

const Footer = styled(FlexSpaceBetween)`
  padding: 2rem 1rem;
  background: #f9f9f9;
`;

// link: http://localhost:3003/LA_Phouvong%20District/dashboard?dashboard=essdpEarlyChildhood
// dashboard_id: 60de99ce61f76a1b830009bb
// dashboard_item_id: 61037abcee442913e3000037

export const ListVisual = () => {
  return (
    <Container>
      <Header>
        <Heading>
          HLO 1: Increased number of graduates at all levels with improved learning outcomes with
          special focus on disadvantaged and gender equity
        </Heading>
      </Header>
      <Body>
        {data.map(outcome => {
          return (
            <>
              <Row style={{ background: '#FFEFEF' }}>
                <Cell>
                  <Text>
                    <strong>{outcome.heading}</strong>
                  </Text>
                </Cell>
                <CircleCell color={outcome.color} />
              </Row>
              {outcome.data.map(target => {
                return (
                  <Row component={RouterLink}>
                    <Cell>
                      <Text>{target.heading}</Text>
                    </Cell>
                    <CircleCell>
                      <Circle color={target.color} />
                    </CircleCell>
                  </Row>
                );
              })}
            </>
          );
        })}
      </Body>
      <Footer>
        <div>Export</div>
        {/*<DashboardReportModal*/}
        {/*  buttonText="See More"*/}
        {/*  name={name}*/}
        {/*  dashboardCode={dashboardCode}*/}
        {/*  dashboardName={dashboardName}*/}
        {/*  entityCode={entityCode}*/}
        {/*  reportCode={reportCode}*/}
        {/*  // periodGranularity={periodGranularity}*/}
        {/*  // viewConfig={viewConfig}*/}
        {/*/>*/}
      </Footer>
    </Container>
  );
};
