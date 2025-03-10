import React from 'react';
import styled from 'styled-components';
import Typography from '@material-ui/core/Typography';
import { CalendarToday } from '@material-ui/icons';
import { CardContent, CardHeader, Card } from '@tupaia/ui-components';
import { Container, Main, Sidebar } from '../../components';
import { AlertsPanel, AlertsPanelProvider, AlertsTable } from '../../containers';
import { getCurrentPeriod, getDisplayDatesByPeriod, getWeekNumberByPeriod } from '../../utils';

const DateSubtitle = styled(Typography)`
  margin-top: 1rem;
  font-weight: 400;
  color: ${props => props.theme.palette.text.secondary};
`;

export const AlertsTabView = React.memo(() => {
  const period = getCurrentPeriod();

  return (
    <Container maxWidth="xl">
      <Main>
        <AlertsPanelProvider>
          <AlertsTable period={period} />
          <AlertsPanel />
        </AlertsPanelProvider>
      </Main>
      <Sidebar>
        <Card variant="outlined">
          <CardHeader
            color="primary"
            title="Current Week"
            label={<CalendarToday color="primary" />}
          />
          <CardContent>
            <Typography variant="h4">{`Week ${getWeekNumberByPeriod(period)}`}</Typography>
            <DateSubtitle variant="subtitle2" gutterBottom>
              {getDisplayDatesByPeriod(period)}
            </DateSubtitle>
          </CardContent>
        </Card>
      </Sidebar>
    </Container>
  );
});
