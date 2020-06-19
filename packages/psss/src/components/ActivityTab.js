/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { format } from 'date-fns';
import Typography from '@material-ui/core/Typography';
import { CardTabPanel, WarningCloud } from '@tupaia/ui-components';
import MuiAvatar from '@material-ui/core/Avatar';
import Divider from '@material-ui/core/Divider';
import * as COLORS from '../constants/colors';
import { FetchLoader } from './FetchLoader';
import { fetchStateShape } from '../hooks';

const Container = styled.div`
  margin-bottom: 1.5rem;
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
  margin-top: 3rem;

  &:first-child {
    margin-top: 0;
  }
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

const DateHeader = ({ week, dateTime }) => {
  const date = format(dateTime, 'EEEE, dd MMMM yyyy');
  return (
    <HeaderContainer>
      <FlexRow>
        <DarkHeading>Week {week} - </DarkHeading>
        <Heading>{date}</Heading>
      </FlexRow>
    </HeaderContainer>
  );
};

DateHeader.propTypes = {
  week: PropTypes.number.isRequired,
  dateTime: PropTypes.instanceOf(Date).isRequired,
};

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

const UserUpdate = ({ name, avatar, dateTime, type }) => {
  const time = format(dateTime, 'hh:mm a');

  const Update = () => (
    <React.Fragment>
      <LightText>changed alert status to</LightText>
      <Text>Outbreak</Text>
    </React.Fragment>
  );

  const Note = () => (
    <React.Fragment>
      <LightText>Added a note</LightText>
    </React.Fragment>
  );

  const UpdateContent = type === 'note' ? Note : Update;

  return (
    <UpdateContainer>
      <Time>{time}</Time>
      <FlexRow>
        <Avatar src={avatar} />
        <DarkText>{name}</DarkText>
        <UpdateContent />
      </FlexRow>
    </UpdateContainer>
  );
};

const AlertWrapper = styled.div`
  margin: 2rem 0;
`;

const AlertContainer = styled.div`
  margin: 1.5rem 0;

  svg {
    margin-right: 0.5rem;
  }
`;

const StyledWarningCloud = styled(WarningCloud)`
  font-size: 30px;
  color: ${COLORS.BLUE};
`;

const AlertCreatedUpdate = () => {
  return (
    <AlertWrapper>
      <Divider />
      <AlertContainer>
        <Time>8:45 am</Time>
        <FlexRow>
          <StyledWarningCloud />
          <DarkText>Alert created</DarkText>
        </FlexRow>
      </AlertContainer>
      <Divider />
    </AlertWrapper>
  );
};

UserUpdate.propTypes = {
  name: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  avatar: PropTypes.string.isRequired,
  dateTime: PropTypes.instanceOf(Date).isRequired,
};

export const ActivityTab = ({ state }) => {
  const { data: feed } = state;
  return (
    <CardTabPanel>
      <FetchLoader state={state}>
        {feed.map(week => (
          <Container key={week.id}>
            <DateHeader week={week.week} dateTime={week.dateTime} />
            {week.updates.map((update, index) => (
              <Container key={update.id}>
                <UserUpdate
                  avatar={update.user.avatar}
                  name={update.user.name}
                  dateTime={update.dateTime}
                  type={update.type}
                />
                {index < week.updates.length - 1 && <Divider />}
              </Container>
            ))}
          </Container>
        ))}
        <AlertCreatedUpdate />
      </FetchLoader>
    </CardTabPanel>
  );
};

ActivityTab.propTypes = {
  state: PropTypes.shape(fetchStateShape).isRequired,
};
