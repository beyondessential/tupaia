/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { format } from 'date-fns';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import * as COLORS from '../../../constants/colors';

const CountrySummaryTitle = styled.div`
  color: ${COLORS.TEXT_DARKGREY};
  font-weight: 400;
  font-size: 0.9375rem;
  padding-right: 0.625rem;
`;

export const WeekAndDateCell = ({ weekNumber, startDate, endDate }) => {
  const start = format(startDate, 'LLL d');
  const end = format(endDate, 'LLL d');
  const year = format(endDate, 'yyyy');
  return (
    <CountrySummaryTitle>
      <strong>W{weekNumber}</strong> {`${start} - ${end}, ${year}`}
    </CountrySummaryTitle>
  );
};

WeekAndDateCell.propTypes = {
  weekNumber: PropTypes.number.isRequired,
  startDate: PropTypes.instanceOf(Date).isRequired,
  endDate: PropTypes.instanceOf(Date).isRequired,
};
