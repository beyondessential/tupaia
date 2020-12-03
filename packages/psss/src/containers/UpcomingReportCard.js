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
import { REPORT_STATUSES } from '../constants';

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

const getDisplayDays = days => {
  const d = Math.abs(days);
  return `${Math.abs(d)} day${d > 1 ? 's' : ''}`;
};

const HeaderComponent = ({ status, days }) => {
  const displayDays = getDisplayDays(days);

  if (status === REPORT_STATUSES.UPCOMING && days <= 3) {
    return (
      <CardHeader
        color="error"
        title={`Confirmation due in ${displayDays}`}
        label={<Warning color="error" />}
      />
    );
  }

  if (status === REPORT_STATUSES.UPCOMING && days === 0) {
    return (
      <CardHeader color="error" title="Confirmation due today" label={<Warning color="error" />} />
    );
  }

  if (status === REPORT_STATUSES.OVERDUE) {
    return (
      <CardHeader
        color="error"
        title={`Confirmation overdue by ${displayDays}`}
        label={<Warning color="error" />}
      />
    );
  }

  return <CardHeader title={`Confirmation due in ${displayDays}`} />;
};

HeaderComponent.propTypes = {
  status: PropTypes.string.isRequired,
  days: PropTypes.number.isRequired,
};

export const UpcomingReportCardComponent = ({ handleOpen }) => {
  const { countryCode } = useParams();
  const { isLoading, period, reportStatus, days } = useUpcomingReport(countryCode);

  if (isLoading) {
    return <Card variant="outlined" style={{ height: 300 }} />;
  }

  const buttonText =
    reportStatus === REPORT_STATUSES.UPCOMING && days > 3 ? 'View Now' : 'Review and Confirm Now';

  return (
    <Card variant="outlined">
      <HeaderComponent days={days} status={reportStatus} />
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
