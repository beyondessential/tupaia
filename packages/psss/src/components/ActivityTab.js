/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import Typography from '@material-ui/core/Typography';
import { CardTabPanel } from '@tupaia/ui-components';
import MuiAvatar from '@material-ui/core/Avatar';
import Divider from '@material-ui/core/Divider';
import styled from 'styled-components';
import * as COLORS from '../constants/colors';

const Container = styled.div`
  margin-bottom: 1rem;
`;

const FlexRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
`;

const HeaderContainer = styled.div`
  background: ${COLORS.LIGHTGREY};
  border: 1px solid ${props => props.theme.palette.grey['400']};
  border-radius: 3px 3px 0 0;
  padding: 1.25rem;
  margin-bottom: 1rem;
  margin-top: 1rem;
`;

const Heading = styled(Typography)`
  font-size: 16px;
  line-height: 21px;
  font-weight: 400;
  color: ${props => props.theme.palette.text.secondary};
  margin-right: 0.5rem;
`;

const DarkHeading = styled(Heading)`
  font-weight: 500;
  color: ${props => props.theme.palette.text.primary};
`;

const DateHeader = () => (
  <HeaderContainer>
    <FlexRow>
      <DarkHeading>Week 11 - </DarkHeading>
      <Heading>Monday, 22 December 2020</Heading>
    </FlexRow>
  </HeaderContainer>
);

const Text = styled(Typography)`
  font-weight: 400;
  font-size: 16px;
  margin-right: 0.5rem;
  line-height: 19px;
  color: ${props => props.theme.palette.text.secondary};
`;

const LightText = styled(Text)`
  color: ${props => props.theme.palette.text.tertiary};
`;

const DarkText = styled(Text)`
  font-weight: 500;
  color: ${props => props.theme.palette.text.primary};
`;

const UpdateContainer = styled.div`
  margin-bottom: 1rem;
`;

const Avatar = styled(MuiAvatar)`
  margin-right: 0.5rem;
`;

const Time = styled(Typography)`
  font-size: 14px;
  line-height: 16px;
  color: ${props => props.theme.palette.text.tertiary};
  margin-bottom: 0.5rem;
`;

const UserUpdate = () => (
  <UpdateContainer>
    <Time>8:30 am</Time>
    <FlexRow>
      <Avatar />
      <DarkText>Dr. Sarah De Jones</DarkText>
      <LightText>changes status to</LightText>
      <Text>Archive Outbreak</Text>
    </FlexRow>
  </UpdateContainer>
);

const items = [
  {
    week: 1,
  },
  {
    week: 2,
  },
  {
    week: 3,
  },
];

export const ActivityTab = () => {
  return (
    <CardTabPanel>
      {items.map(data => {
        return (
          <Container key={data.week}>
            <DateHeader />
            <UserUpdate />
            <Divider />
          </Container>
        );
      })}
    </CardTabPanel>
  );
};
