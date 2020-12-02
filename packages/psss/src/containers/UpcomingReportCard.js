/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { getCurrentPeriod } from '@tupaia/utils';
import { getISODay } from 'date-fns';
import Typography from '@material-ui/core/Typography';
import { Warning } from '@material-ui/icons';
import { CardContent, CardFooter, CardHeader, BarMeter, Card, Button } from '@tupaia/ui-components';
import { openWeeklyReportsPanel, setActiveWeek } from '../store';
import {
  getWeekNumberByPeriod,
  getFormattedStartByPeriod,
  getFormattedEndByPeriod,
} from '../utils';

const StyledButton = styled(Button)`
  margin-top: 1rem;
  margin-bottom: 1rem;
`;

const DateSubtitle = styled(Typography)`
  margin-top: 1rem;
  margin-bottom: 1rem;
  font-weight: 400;
  color: ${props => props.theme.palette.text.secondary};
`;

const DUE_ISO_DAY = 3; // wednesday

const getDaysRemaining = () => {
  const isoDay = getISODay(new Date());
  return DUE_ISO_DAY - isoDay;
};

const STATUS = {
  UPCOMING: 'upcoming',
  DUE: 'upcoming',
  OVERDUE: 'upcoming',
};

const getDueStatus = numberOfDays => {
  if (numberOfDays > 0) {
    return STATUS.UPCOMING;
  } else if (numberOfDays < 0) {
    return STATUS.OVERDUE;
  }

  return STATUS.DUE;
};

const Header = {
  [STATUS.UPCOMING]: ({ days }) => (
    <CardHeader
      color="error"
      title={`Confirmation due in ${days} days`}
      label={<Warning color="error" />}
    />
  ),
  [STATUS.OVERDUE]: ({ days }) => (
    <CardHeader
      color="error"
      title={`Confirmation overdue by ${days} days`}
      label={<Warning color="error" />}
    />
  ),
  [STATUS.DUE]: () => (
    <CardHeader color="error" title={`Confirmation due today`} label={<Warning color="error" />} />
  ),
};

export const UpcomingReportCardComponent = ({ handleOpen }) => {
  const isConfirmed = false;
  const period = getCurrentPeriod('WEEK');
  const daysRemaining = getDaysRemaining();
  const status = getDueStatus(daysRemaining);

  const HeaderComponent = Header[status];

  return (
    <Card variant="outlined">
      <HeaderComponent days={daysRemaining} />
      <CardContent>
        <Typography variant="h4">Week {getWeekNumberByPeriod(period)}</Typography>
        <Typography variant="h4" gutterBottom>
          Upcoming Report
        </Typography>
        <DateSubtitle variant="subtitle2" gutterBottom>
          {getFormattedStartByPeriod(period, 'LLL d, yyyy')} -{' '}
          {getFormattedEndByPeriod(period, 'LLL d, yyyy')}
        </DateSubtitle>
        <StyledButton fullWidth onClick={() => handleOpen()}>
          Review and Confirm Now
        </StyledButton>
      </CardContent>
      <CardFooter>
        <BarMeter value={22} total={30} legend="Sites reported" />
      </CardFooter>
    </Card>
  );
};

UpcomingReportCardComponent.propTypes = {
  handleOpen: PropTypes.func.isRequired,
};

const mapDispatchToProps = dispatch => ({
  handleOpen: id => {
    dispatch(setActiveWeek(id));
    dispatch(openWeeklyReportsPanel());
  },
});

export const UpcomingReportCard = connect(null, mapDispatchToProps)(UpcomingReportCardComponent);
