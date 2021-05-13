/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import Typography from '@material-ui/core/Typography';
import CalendarTodayIcon from '@material-ui/icons/CalendarToday';
import { CardContent, CardHeader, Card, IconButton } from '@tupaia/ui-components';
import { Container, Main, Sidebar, WeekPicker } from '../../components';
import { AlertsTable, AlertsPanel } from '../../containers';
import {
  getCurrentPeriod,
  getDateByPeriod,
  getDisplayDatesByPeriod,
  getPeriodByDate,
  getWeekNumberByPeriod,
} from '../../utils';

const CalendarButton = styled(IconButton)`
  &:hover {
    background-color: ${props => props.theme.palette.grey['300']};
  }
`;

const DateSubtitle = styled(Typography)`
  margin-top: 1rem;
  font-weight: 400;
  color: ${props => props.theme.palette.text.secondary};
`;

export const AlertsTabView = React.memo(() => {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [rowData, setRowData] = useState({});
  const [period, setPeriod] = useState(getCurrentPeriod());

  const handleTableRowClick = useCallback(
    data => {
      setIsPanelOpen(true);
      setRowData(data);
    },
    [setIsPanelOpen, setRowData],
  );

  const handlePanelClose = useCallback(() => {
    setIsPanelOpen(false);
  }, [setIsPanelOpen]);

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
        <AlertsTable period={period} onRowClick={handleTableRowClick} />
        <AlertsPanel
          countryCode={rowData.organisationUnit}
          period={rowData.period}
          syndromeName={rowData.syndromeName}
          isOpen={isPanelOpen}
          handleClose={handlePanelClose}
        />
      </Main>
      <Sidebar>
        <Card variant="outlined">
          <CardHeader color="primary" title="Current Week" label={DatePicker} />
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
