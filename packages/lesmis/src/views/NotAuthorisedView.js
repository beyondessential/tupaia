/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React from 'react';
import styled from 'styled-components';
import { Button } from '@tupaia/ui-components';
import Typography from '@material-ui/core/Typography';
import { ReactComponent as NotAuthorisedIcon } from '../components/icons/403.svg';
import { PageHeader } from '../components';
import * as COLORS from '../constants';

const Section = styled.section`
  background: ${COLORS.GREY_F9};
  padding-top: 4rem;
  padding-bottom: 3rem;
  text-align: center;
  min-height: 70vh;
`;

const Text = styled(Typography)`
  margin-top: 3rem;
  margin-bottom: 2.5rem;
`;
export const NotAuthorisedView = () => (
  <>
    <PageHeader
      title="Not Authorised"
      breadcrumbs={[{ name: 'Not Authorised', url: '/not-authorised' }]}
      center
    />
    <Section>
      <NotAuthorisedIcon />
      <Text variant="h4">You are not authorised to view that page</Text>
      <Button component="a" href="/">
        Go back to home page
      </Button>
    </Section>
  </>
);
