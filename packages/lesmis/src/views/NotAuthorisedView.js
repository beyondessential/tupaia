/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React from 'react';
import styled from 'styled-components';
import { Link as RouterLink, useHistory } from 'react-router-dom';
import { Button } from '@tupaia/ui-components';
import Typography from '@material-ui/core/Typography';
import { ReactComponent as NotAuthorisedIcon } from '../components/icons/403.svg';
import { PageHeader } from '../components';
import * as COLORS from '../constants';
import { useUser } from '../api/queries';

const Section = styled.section`
  background: ${COLORS.GREY_F9};
  padding-top: 4rem;
  padding-bottom: 3rem;
  text-align: center;
  min-height: 70vh;
`;

const Heading = styled(Typography)`
  margin-top: 3rem;
  margin-bottom: 1rem;
`;

const Text = styled(Typography)`
  color: ${props => props.theme.palette.text.secondary};
  margin-bottom: 2.5rem;
`;

export const NotAuthorisedView = () => {
  const history = useHistory();
  const { isLoading, isLoggedIn } = useUser();

  return (
    <>
      <PageHeader
        title="Not Authorised"
        breadcrumbs={[{ name: 'Not Authorised', url: '/not-authorised' }]}
        center
      />
      <Section>
        <NotAuthorisedIcon />
        <Heading variant="h4">You are not authorised to view this page</Heading>
        <Text>If you would like access please contact an administrator.</Text>
        {isLoggedIn && (
          <Button component={RouterLink} to="/">
            Go back to home page
          </Button>
        )}
        {!isLoggedIn && !isLoading && (
          <Button
            component={RouterLink}
            to={{
              pathname: '/login',
              state: { referer: history.location },
            }}
          >
            Login
          </Button>
        )}
      </Section>
    </>
  );
};
