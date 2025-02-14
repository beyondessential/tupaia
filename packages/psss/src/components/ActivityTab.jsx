import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { format } from 'date-fns';
import { Container } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import { CardTabPanel, WarningCloud } from '@tupaia/ui-components';
import MuiAvatar from '@material-ui/core/Avatar';
import { FetchLoader } from './FetchLoader';
import { FlexStart } from './Layout';
import { fetchStateShape } from '../hooks';
import * as COLORS from '../constants/colors';
import { ComingSoon } from './ComingSoon';

const InnerContainer = styled.div`
  padding: 1.25rem 0.7rem;
  border-bottom: 1px solid ${props => props.theme.palette.grey['400']};

  &:last-child {
    border: none;
  }
`;

const HeaderContainer = styled.div`
  background: ${COLORS.LIGHTGREY};
  border: 1px solid ${props => props.theme.palette.grey['400']};
  border-radius: 3px 3px 0 0;
  padding: 1.25rem;
  margin-top: 1.5rem;
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

const AlertContainer = styled.div`
  padding: 1.25rem 0.7rem;
  border-bottom: 1px solid ${props => props.theme.palette.grey['400']};
  border-top: 1px solid ${props => props.theme.palette.grey['400']};

  svg {
    margin-right: 0.5rem;
  }
`;

const StyledWarningCloud = styled(WarningCloud)`
  font-size: 2rem;
  color: ${COLORS.BLUE};
`;

const AM_PM_DATE_FORMAT = "h:mm aaaaa'm'";

export const ActivityTab = React.memo(({ state, NotesTabLink }) => {
  const { data: feed } = state;
  const exampleDate = new Date();
  return (
    <Container style={{ position: 'relative' }}>
      <ComingSoon text="Alert activity coming soon" />
      <CardTabPanel>
        <FetchLoader state={state}>
          {feed.map(week => (
            <article key={week.id}>
              <HeaderContainer>
                <Heading>
                  <DarkTextSpan>Week {week.week} - </DarkTextSpan>
                  {format(week.dateTime, 'EEEE, dd MMMM yyyy')}
                </Heading>
              </HeaderContainer>
              {week.updates.map(update => (
                <InnerContainer key={update.id}>
                  <Time>{format(update.dateTime, AM_PM_DATE_FORMAT)}</Time>
                  <FlexStart>
                    <Avatar src={update.user.avatar} />
                    <Text>
                      <DarkTextSpan>{update.user.name}</DarkTextSpan>{' '}
                      {update.type === 'note' ? (
                        <LightTextSpan>Added a {NotesTabLink}</LightTextSpan>
                      ) : (
                        <>
                          <LightTextSpan>changed alert status to</LightTextSpan> Outbreak
                        </>
                      )}
                    </Text>
                  </FlexStart>
                </InnerContainer>
              ))}
            </article>
          ))}
          <AlertContainer>
            <Time>{format(exampleDate, AM_PM_DATE_FORMAT)}</Time>
            <FlexStart>
              <StyledWarningCloud />
              <Text>
                <DarkTextSpan>Alert created</DarkTextSpan>
              </Text>
            </FlexStart>
          </AlertContainer>
        </FetchLoader>
      </CardTabPanel>
    </Container>
  );
});

ActivityTab.propTypes = {
  state: PropTypes.shape(fetchStateShape).isRequired,
  NotesTabLink: PropTypes.node.isRequired,
};
