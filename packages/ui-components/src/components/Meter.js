/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import * as COLORS from '../theme/colors';

const Bar = styled.div`
  position: relative;
`;

const OuterBar = styled.div`
  background-color: ${props => props.theme.palette.primary.main};
  border-radius: 10px;
  height: 10px;
  width: 100%;
  opacity: 0.2;
`;

const InnerBar = styled(OuterBar)`
  position: absolute;
  top: 0;
  left: 0;
  background-color: ${props => props.theme.palette.primary.main};
  opacity: 0.5;
`;

const Legend = styled(Typography)`
  color: ${COLORS.TEXT_MIDGREY};
  font-weight: 500;
  font-size: 11px;
  line-height: 13px;
  text-transform: uppercase;
  margin-bottom: 10px;
`;

const LegendValue = styled.span`
  color: ${COLORS.TEXT_DARKGREY};
`;

export const Meter = ({ value, total, legend }) => (
  <div>
    <Legend>
      {legend}: <LegendValue>{`${value}/${total}`}</LegendValue>
    </Legend>
    <Bar>
      <OuterBar />
      <InnerBar style={{ width: `${(value / total) * 100}%` }} />
    </Bar>
  </div>
);

Meter.propTypes = {
  value: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
  legend: PropTypes.string,
};

Meter.defaultProps = {
  legend: 'Value',
};
