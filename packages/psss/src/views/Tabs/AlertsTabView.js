/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React, { useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import Typography from '@material-ui/core/Typography';
import { CalendarToday } from '@material-ui/icons';
import { CardContent, CardHeader, Card } from '@tupaia/ui-components';
import { Container, Main, Sidebar, ComingSoon } from '../../components';
import { AlertsTable, AlertsPanel } from '../../containers';

const DateSubtitle = styled(Typography)`
  margin-top: 1rem;
  font-weight: 400;
  color: ${props => props.theme.palette.text.secondary};
`;

export const AlertsTabView = React.memo(() => {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const { countryCode } = useParams();

  const handlePanelOpen = useCallback(() => {
    setIsPanelOpen(true);
  }, [setIsPanelOpen]);

  const handlePanelClose = useCallback(() => {
    setIsPanelOpen(false);
  }, [setIsPanelOpen]);

  return (
    <Container>
      <ComingSoon text="The Alerts page will show Syndromes that have reached alert level." />
      <Main>
        <AlertsTable handlePanelOpen={handlePanelOpen} countryCode={countryCode} />
        <AlertsPanel isOpen={isPanelOpen} handleClose={handlePanelClose} />
      </Main>
      {/* Temporarily removed for MVP release. Please do not delete */}
      {/*<Sidebar>*/}
      {/*  <Card variant="outlined">*/}
      {/*    <CardHeader*/}
      {/*      color="primary"*/}
      {/*      title="Current Week"*/}
      {/*      label={<CalendarToday color="primary" />}*/}
      {/*    />*/}
      {/*    <CardContent>*/}
      {/*      <Typography variant="h4">Week 10</Typography>*/}
      {/*      <DateSubtitle variant="subtitle2" gutterBottom>*/}
      {/*        Feb 25, 2020 - Mar 1, 2020*/}
      {/*      </DateSubtitle>*/}
      {/*    </CardContent>*/}
      {/*  </Card>*/}
      {/*</Sidebar>*/}
    </Container>
  );
});
