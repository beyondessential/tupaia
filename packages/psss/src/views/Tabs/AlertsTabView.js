/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import Typography from '@material-ui/core/Typography';
import CalendarTodayIcon from '@material-ui/icons/CalendarToday';
import { CardContent, CardHeader, Card, IconButton } from '@tupaia/ui-components';
import { ComingSoon, Container, Main, Sidebar, WeekPicker } from '../../components';
import {
  AlertsPanel,
  AlertsPanelProvider,
  AlertsTable,
  OutbreaksPanel,
  OutbreaksTable,
} from '../../containers';
import {
  getCurrentPeriod,
  getDateByPeriod,
  getDisplayDatesByPeriod,
  getPeriodByDate,
  getWeekNumberByPeriod,
} from '../../utils';

const CalendarButton = styled(IconButton)`
  &:hover {
    background-color: ${props => props.theme.palette.grey['200']};
  }
`;

const DateSubtitle = styled(Typography)`
  margin-top: 1rem;
  font-weight: 400;
  color: ${props => props.theme.palette.text.secondary};
`;

export const AlertsTabView = React.memo(() => {
  const { category: alertsCategory } = useParams();
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [period, setPeriod] = useState(getCurrentPeriod());

  const DatePicker = (
    <>
      <CalendarButton onClick={() => setIsPickerOpen(true)}>
        <CalendarTodayIcon />
      </CalendarButton>
      <WeekPicker
        label="Date"
        onChange={newDate => setPeriod(getPeriodByDate(newDate))}
        value={getDateByPeriod(period)}
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
      />
    </>
  );

  return (
    <div style={{ position: 'relative' }}>
      {alertsCategory === 'outbreaks' && (
        <ComingSoon text="The Outbreaks page will show archived Alerts and Outbreaks." />
      )}
      <Container>
        <Main>
          <AlertsPanelProvider>
            {/* TODO Outbreak and Alert components could be merged when outbreaks are implemented */}
            {alertsCategory === 'outbreaks' ? <OutbreaksTable /> : <AlertsTable period={period} />}
            {alertsCategory === 'outbreaks' ? <OutbreaksPanel /> : <AlertsPanel />}
          </AlertsPanelProvider>
        </Main>
        {alertsCategory !== 'outbreaks' && (
          <Sidebar>
            <Card variant="outlined">
              <CardHeader color="primary" title="Selected Week" label={DatePicker} />
              <CardContent>
                <Typography variant="h4">{`Week ${getWeekNumberByPeriod(period)}`}</Typography>
                <DateSubtitle variant="subtitle2" gutterBottom>
                  {getDisplayDatesByPeriod(period)}
                </DateSubtitle>
              </CardContent>
            </Card>
          </Sidebar>
        )}
      </Container>
    </div>
  );
});
