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
import MuiLink from '@material-ui/core/Link';
import { FetchLoader } from './FetchLoader';
import { FlexRow } from './Layout';
import { fetchStateShape } from '../hooks';
import * as COLORS from '../constants/colors';

const Container = styled.div`
  margin-bottom: 1.8rem;
`;

const HeaderContainer = styled.div`
  background: ${COLORS.LIGHTGREY};
  border: 1px solid ${props => props.theme.palette.grey['400']};
  border-radius: 3px 3px 0 0;
  padding: 1.25rem;
  margin-bottom: 1rem;
  margin-top: 3rem;

  &:first-child {
    margin-top: 1rem;
  }
`;

const Heading = styled(Typography)`
  font-size: 1rem;
  line-height: 1.3rem;
  font-weight: 400;
  color: ${props => props.theme.palette.text.secondary};
  margin-right: 0.5rem;
`;

const DarkTextSpan = styled.span`
  font-weight: 500;
  color: ${props => props.theme.palette.text.primary};
`;

const DateHeader = ({ week, dateTime }) => (
  <HeaderContainer>
    <Heading>
      <DarkTextSpan>Week {week} - </DarkTextSpan>
      {format(dateTime, 'EEEE, dd MMMM yyyy')}
    </Heading>
  </HeaderContainer>
);

DateHeader.propTypes = {
  week: PropTypes.number.isRequired,
  dateTime: PropTypes.instanceOf(Date).isRequired,
};

const UpdateContainer = styled.div`
  margin: 0 0.625rem 1rem;
`;

const Text = styled(Typography)`
  font-weight: 400;
  font-size: 1rem;
  margin-right: 0.3rem;
  line-height: 1.2rem;
  color: ${props => props.theme.palette.text.secondary};
`;

const LightTextSpan = styled.span`
  color: ${props => props.theme.palette.text.tertiary};
`;

const Avatar = styled(MuiAvatar)`
  margin-right: 0.5rem;
`;

const Time = styled(Typography)`
  font-size: 0.875rem;
  line-height: 1rem;
  color: ${props => props.theme.palette.text.secondary};
  margin-bottom: 0.5rem;
`;

const Link = styled(MuiLink)`
  text-decoration: underline;
  font-size: 1rem;
  line-height: 1.2rem;
`;

const UserUpdate = ({ name, avatar, dateTime, type }) => {
  const Update = () => (
    <>
      <LightTextSpan>changed alert status to</LightTextSpan> Outbreak
    </>
  );

  const Note = () => (
    <LightTextSpan>
      Added a <Link component="button">note</Link>
    </LightTextSpan>
  );

  const UpdateContent = type === 'note' ? Note : Update;

  return (
    <UpdateContainer>
      <Time>{format(dateTime, "h:mm aaaaa'm'")}</Time>
      <FlexRow>
        <Avatar src={avatar} />
        <Text>
          <DarkTextSpan>{name}</DarkTextSpan> <UpdateContent />
        </Text>
      </FlexRow>
    </UpdateContainer>
  );
};

UserUpdate.propTypes = {
  name: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  avatar: PropTypes.string.isRequired,
  dateTime: PropTypes.instanceOf(Date).isRequired,
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
  font-size: 2rem;
  color: ${COLORS.BLUE};
`;

const AlertCreatedUpdate = ({ dateTime }) => (
  <AlertWrapper>
    <Divider />
    <AlertContainer>
      <Time>{format(dateTime, "h:mm aaaaa'm'")}</Time>
      <FlexRow>
        <StyledWarningCloud />
        <DarkTextSpan>Alert created</DarkTextSpan>
      </FlexRow>
    </AlertContainer>
    <Divider />
  </AlertWrapper>
);

AlertCreatedUpdate.propTypes = {
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
        <AlertCreatedUpdate dateTime={new Date()} />
      </FetchLoader>
    </CardTabPanel>
  );
};

ActivityTab.propTypes = {
  state: PropTypes.shape(fetchStateShape).isRequired,
};
