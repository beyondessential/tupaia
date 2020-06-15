/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { Error } from '@material-ui/icons';
import { Link as RouterLink } from 'react-router-dom';
import MuiLink from '@material-ui/core/Link';
import { format } from 'date-fns';
import { IconButton } from '@material-ui/core';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import Avatar from '@material-ui/core/Avatar';
import { Tooltip } from '@tupaia/ui-components';
import { countryFlagImage } from '../../utils';
import * as COLORS from '../../constants/colors';
import { openAlertsPanel } from '../../store';

const StyledAlert = styled.div`
  display: inline-flex;
  align-items: center;
  padding: 6px 10px;
  background: ${props => props.theme.palette.warning.light};
  border-radius: 5px;
  color: ${props => props.theme.palette.warning.main};
  font-weight: 500;
  font-size: 16px;
  line-height: 19px;

  .MuiSvgIcon-root {
    width: 20px;
    height: 20px;
    margin-left: 5px;
  }
`;

/*
 * Conditionally displays the value styled as an alert
 */
export const AlertCell = props => {
  const { displayValue } = props;
  // this is just temporary logic until real data is in place
  if (displayValue > 900) {
    return (
      <StyledAlert>
        {displayValue}
        <Error />
      </StyledAlert>
    );
  }

  return displayValue;
};

const WarningStyleText = styled.span`
  color: ${props => props.theme.palette.warning.main};
  font-weight: 500;
`;

const SuccessStyleText = styled.span`
  color: ${props => props.theme.palette.success.main};
  font-weight: 500;
`;

/*
 * Displays a value as a percentage
 */
export const PercentageChangeCell = ({ percentageChange }) => {
  if (percentageChange > 0) {
    return <WarningStyleText>{`${percentageChange}%`}</WarningStyleText>;
  }

  return <SuccessStyleText>{percentageChange}</SuccessStyleText>;
};

PercentageChangeCell.propTypes = {
  percentageChange: PropTypes.number.isRequired,
};

const CountryTitle = styled(MuiLink)`
  display: flex;
  align-items: center;
  font-weight: 400;
  font-size: 1.125rem;
  color: ${COLORS.BLUE};

  .MuiAvatar-root {
    margin-right: 0.6rem;
    color: ${COLORS.GREY_DE};
    background-color: ${COLORS.GREY_DE};
  }
`;

export const CountryNameCell = ({ name, countryCode }) => {
  return (
    <CountryTitle to="weekly-reports/samoa" component={RouterLink}>
      <Avatar src={countryFlagImage(countryCode)} /> {name}
    </CountryTitle>
  );
};

CountryNameCell.propTypes = {
  name: PropTypes.string.isRequired,
  countryCode: PropTypes.string,
};

CountryNameCell.defaultProps = {
  countryCode: null,
};

export const CountryNameButton = ({ handleClick }) => {
  // eslint-disable-next-line react/prop-types
  return ({ name, countryCode }) => {
    return (
      <CountryTitle onClick={handleClick}>
        <Avatar src={countryFlagImage(countryCode)} /> {name}
      </CountryTitle>
    );
  };
};

CountryNameButton.propTypes = {
  handleClick: PropTypes.func.isRequired,
};

export const CountryNameButtonCreator = actionCreator => {
  const mapDispatchToProps = dispatch => ({
    handleClick: () => dispatch(actionCreator()),
  });
  return connect(null, mapDispatchToProps)(CountryNameButton);
};

const CountrySummaryTitle = styled.div`
  color: ${COLORS.TEXT_DARKGREY};
  font-weight: 400;
  font-size: 0.9375rem;
  padding-right: 10px;
`;

export const WeekAndDateCell = ({ week, startDate, endDate }) => {
  const start = `${format(startDate, 'LLL d')}`;
  const end = `${format(endDate, 'LLL d')}`;
  const year = `${format(endDate, 'yyyy')}`;
  return (
    <CountrySummaryTitle>
      <strong>W{week}</strong> {`${start} - ${end}, ${year}`}
    </CountrySummaryTitle>
  );
};

WeekAndDateCell.propTypes = {
  week: PropTypes.number.isRequired,
  startDate: PropTypes.instanceOf(Date).isRequired,
  endDate: PropTypes.instanceOf(Date).isRequired,
};

const DottedUnderline = styled.div`
  display: inline-block;
  border-bottom: 1px dotted ${props => props.theme.palette.text.secondary};
`;

export const SyndromeCell = ({ syndrome }) => (
  <Tooltip title="Acute Fever and Rash">
    <DottedUnderline>{syndrome}</DottedUnderline>
  </Tooltip>
);

SyndromeCell.propTypes = {
  syndrome: PropTypes.string.isRequired,
};

// Todo: update placeholder number
export const SitesReportedCell = data => {
  return (
    <Tooltip title="Submitted: 1day ago">
      <DottedUnderline>{`${data.sitesReported}/30`}</DottedUnderline>
    </Tooltip>
  );
};

export const AlertMenuCell = () => (
  <IconButton>
    <MoreVertIcon />
  </IconButton>
);

export const StartDateCell = ({ startDate }) => {
  return format(startDate, 'LLL d, yyyy');
};
