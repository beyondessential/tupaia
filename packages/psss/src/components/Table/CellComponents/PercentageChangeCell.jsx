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
  if (percentageChange === undefined) {
    return '-';
  }

  const roundedValue = Math.round(percentageChange * 100);

  if (roundedValue > 0) {
    return <WarningStyleText className={className}>+{roundedValue}%</WarningStyleText>;
  }

  return <SuccessStyleText className={className}>{roundedValue}%</SuccessStyleText>;
};

PercentageChangeCell.propTypes = {
  percentageChange: PropTypes.number,
  className: PropTypes.string,
};

PercentageChangeCell.defaultProps = {
  className: '',
  percentageChange: undefined,
};
