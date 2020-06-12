/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import Typography from '@material-ui/core/Typography';
import styled from 'styled-components';
import { CalendarToday } from '@material-ui/icons';
import { CardContent, CardHeader, Card } from '@tupaia/ui-components';
import { Container, Main, Sidebar, AlertsTable } from '../components';

const StyledText = styled(Typography)`
  margin-top: 1rem;
  font-weight: 400;
  color: ${props => props.theme.palette.text.secondary};
`;

export const AlertsTabView = () => (
  <Container>
    <Main>
      <AlertsTable />
    </Main>
    <Sidebar>
      <Card variant="outlined">
        <CardHeader color="primary" title="Week 10" label={<CalendarToday color="primary" />} />
        <CardContent>
          <Typography variant="h4">Current Week</Typography>
          <StyledText variant="subtitle2" gutterBottom>
            Feb 25, 2020 - Mar 1, 2020
          </StyledText>
        </CardContent>
      </Card>
    </Sidebar>
  </Container>
);
