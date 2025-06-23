import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { useParams } from 'react-router-dom';
import Typography from '@material-ui/core/Typography';
import { Warning } from '@material-ui/icons';
import { CardContent, CardHeader, Card, Button } from '@tupaia/ui-components';
import { openWeeklyReportsPanel } from '../store';
import {
  getWeekNumberByPeriod,
  getFormattedStartByPeriod,
  getFormattedEndByPeriod,
} from '../utils';
import { useUpcomingReport } from '../api/queries';
import { REPORT_STATUSES, DUE_ISO_DAY } from '../constants';

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
  return `${d} day${d > 1 ? 's' : ''}`;
};

const HeaderComponent = ({ status, daysTillDueDay }) => {
  const displayDays = getDisplayDays(daysTillDueDay);

  if (status === REPORT_STATUSES.UPCOMING) {
    const title =
      daysTillDueDay === 0 ? 'Confirmation due today' : `Confirmation due in ${displayDays}`;
    return <CardHeader color="error" title={title} label={<Warning color="error" />} />;
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
  daysTillDueDay: PropTypes.number.isRequired,
};

export const UpcomingReportCardComponent = ({ handleOpen }) => {
  const { countryCode } = useParams();
  const { isLoading, period, reportStatus, daysTillDueDay } = useUpcomingReport(countryCode);

  if (isLoading) {
    return <Card variant="outlined" style={{ height: 300 }} />;
  }

  const buttonText =
    reportStatus === REPORT_STATUSES.UPCOMING && daysTillDueDay > DUE_ISO_DAY
      ? 'View Now'
      : 'Review and Confirm Now';

  return (
    <Card variant="outlined">
      <HeaderComponent daysTillDueDay={daysTillDueDay} status={reportStatus} />
      <CardContent>
        <Typography variant="h4">Week {getWeekNumberByPeriod(period)}</Typography>
        <Typography variant="h4" gutterBottom>
          Upcoming Report
        </Typography>
        <DateSubtitle variant="subtitle2" gutterBottom>
          {getFormattedStartByPeriod(period, 'LLL d, yyyy')} -{' '}
          {getFormattedEndByPeriod(period, 'LLL d, yyyy')}
        </DateSubtitle>
        <StyledButton fullWidth onClick={() => handleOpen(period)}>
          {buttonText}
        </StyledButton>
      </CardContent>
      {/* Removed until there is data @see https://app.zenhub.com/workspaces/sprint-board-5eea9d3de8519e0019186490/issues/beyondessential/tupaia-backlog/1336
      <CardFooter>
        <BarMeter value={22} total={30} legend="Sites reported" />
      </CardFooter> */}
    </Card>
  );
};

UpcomingReportCardComponent.propTypes = {
  handleOpen: PropTypes.func.isRequired,
};

const mapDispatchToProps = dispatch => ({
  handleOpen: period => dispatch(openWeeklyReportsPanel(period)),
});

export const UpcomingReportCard = connect(null, mapDispatchToProps)(UpcomingReportCardComponent);
