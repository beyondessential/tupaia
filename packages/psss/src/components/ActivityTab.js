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

const UpdateContainer = styled.div`
  margin: 0 0.625rem 1rem;
`;

const Heading = styled(Typography)`
  font-size: 1rem;
  line-height: 1.3rem;
  font-weight: 400;
  color: ${props => props.theme.palette.text.secondary};
  margin-right: 0.5rem;
`;

const Text = styled(Typography)`
  font-weight: 400;
  font-size: 1rem;
  margin-right: 0.3rem;
  line-height: 1.2rem;
  color: ${props => props.theme.palette.text.secondary};
`;

const DarkTextSpan = styled.span`
  font-weight: 500;
  color: ${props => props.theme.palette.text.primary};
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

export const ActivityTab = React.memo(({ state, NoteLink }) => {
  const { data: feed } = state;
  const exampleDate = new Date();
  return (
    <CardTabPanel>
      <FetchLoader state={state}>
        {feed.map(week => (
          <Container key={week.id}>
            <HeaderContainer>
              <Heading>
                <DarkTextSpan>Week {week.week} - </DarkTextSpan>
                {format(week.dateTime, 'EEEE, dd MMMM yyyy')}
              </Heading>
            </HeaderContainer>
            {week.updates.map((update, index) => (
              <Container key={update.id}>
                <UpdateContainer>
                  <Time>{format(update.dateTime, "h:mm aaaaa'm'")}</Time>
                  <FlexRow>
                    <Avatar src={update.user.avatar} />
                    <Text>
                      <DarkTextSpan>{update.user.name}</DarkTextSpan>{' '}
                      {update.type === 'note' ? (
                        <LightTextSpan>
                          Added a <NoteLink>note</NoteLink>
                        </LightTextSpan>
                      ) : (
                        <>
                          <LightTextSpan>changed alert status to</LightTextSpan> Outbreak
                        </>
                      )}
                    </Text>
                  </FlexRow>
                </UpdateContainer>
                {index < week.updates.length - 1 && <Divider />}
              </Container>
            ))}
          </Container>
        ))}
        <AlertWrapper>
          <Divider />
          <AlertContainer>
            <Time>{format(exampleDate, "h:mm aaaaa'm'")}</Time>
            <FlexRow>
              <StyledWarningCloud />
              <DarkTextSpan>Alert created</DarkTextSpan>
            </FlexRow>
          </AlertContainer>
          <Divider />
        </AlertWrapper>
      </FetchLoader>
    </CardTabPanel>
  );
});

ActivityTab.propTypes = {
  state: PropTypes.shape(fetchStateShape).isRequired,
  NoteLink: PropTypes.any.isRequired,
};
