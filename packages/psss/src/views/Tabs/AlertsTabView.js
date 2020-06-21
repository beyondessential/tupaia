/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React, { useState } from 'react';
import Typography from '@material-ui/core/Typography';
import styled from 'styled-components';
import { CalendarToday } from '@material-ui/icons';
import { CardContent, CardHeader, Card } from '@tupaia/ui-components';
import { Container, Main, Sidebar } from '../../components';
import { AlertsTable, AlertsPanel } from '../../containers';

const DateSubtitle = styled(Typography)`
  margin-top: 1rem;
  font-weight: 400;
  color: ${props => props.theme.palette.text.secondary};
`;

export const AlertsTabView = () => {
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const handlePanelOpen = () => {
    setIsPanelOpen(true);
  };
  const handlePanelClose = () => {
    setIsPanelOpen(false);
  };
  return (
    <Container>
      <Main>
        <AlertsTable handlePanelOpen={handlePanelOpen} />
        <AlertsPanel isOpen={isPanelOpen} handleClose={handlePanelClose} />
      </Main>
      <Sidebar>
        <Card variant="outlined">
          <CardHeader
            color="primary"
            title="Current Week"
            label={<CalendarToday color="primary" />}
          />
          <CardContent>
            <Typography variant="h4">Week 10</Typography>
            <DateSubtitle variant="subtitle2" gutterBottom>
              Feb 25, 2020 - Mar 1, 2020
            </DateSubtitle>
          </CardContent>
        </Card>
      </Sidebar>
    </Container>
  );
};
