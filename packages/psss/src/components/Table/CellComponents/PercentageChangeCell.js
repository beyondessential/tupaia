/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';

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
export const PercentageChangeCell = ({ percentageChange, className }) => {
  if (percentageChange > 0) {
    return <WarningStyleText className={className}>+{percentageChange}%</WarningStyleText>;
  }

  return <SuccessStyleText className={className}>-{percentageChange}%</SuccessStyleText>;
};

PercentageChangeCell.propTypes = {
  percentageChange: PropTypes.number.isRequired,
  className: PropTypes.string,
};

PercentageChangeCell.defaultProps = {
  className: '',
};
