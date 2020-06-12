/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import Typography from '@material-ui/core/Typography';
import { CardContent, CardHeader, Card } from '@tupaia/ui-components';
import { Container, Main, Sidebar, AlertsTable } from '../components';

const StyledCardContent = styled(CardContent)`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const AlertsTabView = () => (
  <Container>
    <Main>
      <AlertsTable />
    </Main>
    <Sidebar>
      <Card variant="outlined">
        <CardHeader title="Current Week" label="Week 10" />
        <StyledCardContent>
          <Typography variant="h3">Week 10</Typography>
        </StyledCardContent>
      </Card>
    </Sidebar>
  </Container>
);
