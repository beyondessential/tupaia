/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import styled from 'styled-components';
import Typography from '@material-ui/core/Typography';
import CalendarTodayIcon from '@material-ui/icons/CalendarToday';
import { CardContent, CardHeader, Card, IconButton } from '@tupaia/ui-components';
import { Container, Main, Sidebar, WeekPicker } from '../../components';
import { AlertsPanel, AlertsPanelProvider, AlertsTable } from '../../containers';
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

export const AlertsTabView = React.memo(({ alertStatus }) => {
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
    <Container>
      <Main>
        <AlertsPanelProvider>
          <AlertsTable period={period} alertStatus={alertStatus} />
          <AlertsPanel />
        </AlertsPanelProvider>
      </Main>
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
    </Container>
  );
});

AlertsTabView.propTypes = {
  alertStatus: PropTypes.string.isRequired,
};
