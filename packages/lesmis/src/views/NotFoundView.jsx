import React from 'react';
import styled from 'styled-components';
import { Button } from '@tupaia/ui-components';
import Typography from '@material-ui/core/Typography';
import { NotFound as NotFoundIcon } from '../components/Icons/NotFound';
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

export const NotFoundView = () => (
  <>
    <PageHeader
      title="Page not found"
      breadcrumbs={[{ name: 'Page Not Found', url: '/page-not-found' }]}
      center
    />
    <Section>
      <NotFoundIcon />
      <Text variant="h4">The page you are looking for does not exist</Text>
      <Button component="a" href="/">
        Go back to home page
      </Button>
    </Section>
  </>
);
