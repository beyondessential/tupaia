import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import * as COLORS from '../../../constants/colors';
import { getDisplayDatesByPeriod, getWeekNumberByPeriod } from '../../../utils';

const WeekAndDateTitle = styled.div`
  color: ${COLORS.TEXT_DARKGREY};
  font-weight: 400;
  font-size: 0.9375rem;
  padding-right: 0.625rem;
`;

export const WeekAndDateCell = ({ period }) => (
  <WeekAndDateTitle>
    <strong>W{getWeekNumberByPeriod(period)}</strong> {getDisplayDatesByPeriod(period)}
  </WeekAndDateTitle>
);

WeekAndDateCell.propTypes = {
  period: PropTypes.string.isRequired,
};
