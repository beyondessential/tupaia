/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { useParams } from 'react-router-dom';
import Typography from '@material-ui/core/Typography';
import { Warning } from '@material-ui/icons';
import { CardContent, CardFooter, CardHeader, BarMeter, Card, Button } from '@tupaia/ui-components';
import { openWeeklyReportsPanel, setActiveWeek } from '../store';
import {
  getWeekNumberByPeriod,
  getFormattedStartByPeriod,
  getFormattedEndByPeriod,
} from '../utils';
import { useUpcomingReport } from '../api/queries';

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

const STATUS = {
  DEFAULT: 'default',
  UPCOMING: 'upcoming',
  DUE_TODAY: 'today',
  OVERDUE: 'overdue',
};

const Header = {
  [STATUS.DEFAULT]: ({ days }) => <CardHeader title={`Confirmation due in ${days}`} />,
  [STATUS.UPCOMING]: ({ days }) => (
    <CardHeader
      color="error"
      title={`Confirmation due in ${days}`}
      label={<Warning color="error" />}
    />
  ),
  [STATUS.OVERDUE]: ({ days }) => (
    <CardHeader
      color="error"
      title={`Confirmation overdue by ${days}`}
      label={<Warning color="error" />}
    />
  ),
  [STATUS.DUE_TODAY]: () => (
    <CardHeader color="error" title="Confirmation due today" label={<Warning color="error" />} />
  ),
};

export const UpcomingReportCardComponent = ({ handleOpen }) => {
  const { countryCode } = useParams();
  const { isLoading, period, reportStatus, displayDays } = useUpcomingReport(countryCode);

  if (isLoading) {
    return <Card variant="outlined" style={{ height: 300 }} />;
  }

  const HeaderComponent = Header[reportStatus];
  const buttonText = reportStatus === STATUS.DEFAULT ? 'View Now' : 'Review and Confirm Now';

  return (
    <Card variant="outlined">
      <HeaderComponent days={displayDays} />
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
          {buttonText}
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
