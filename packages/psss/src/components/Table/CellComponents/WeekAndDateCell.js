/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { format } from 'date-fns';
import PropTypes from 'prop-types';
import { convertPeriodStringToDateRange } from '@tupaia/utils';
import styled from 'styled-components';
import * as COLORS from '../../../constants/colors';

const CountrySummaryTitle = styled.div`
  color: ${COLORS.TEXT_DARKGREY};
  font-weight: 400;
  font-size: 0.9375rem;
  padding-right: 0.625rem;
`;

export const WeekAndDateCell = ({ period }) => {
  const weekNumber = period.split('W').pop();
  const dates = convertPeriodStringToDateRange(period);
  const start = `${format(new Date(dates[0]), 'LLL d')}`;
  const end = `${format(new Date(dates[1]), 'LLL d, yyyy')}`;
  return (
    <CountrySummaryTitle>
      <strong>W{weekNumber}</strong> {`${start} - ${end}`}
    </CountrySummaryTitle>
  );
};

WeekAndDateCell.propTypes = {
  period: PropTypes.string.isRequired,
};
