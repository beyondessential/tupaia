/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';
import * as COLORS from '../theme/colors';
import { LIGHTGREY } from '../theme/colors';

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

const Circle = styled.div`
  position: relative;
  display: inline-block;
  font-size: 0;
`;

const PercentText = styled(Typography)`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: ${COLORS.TEXT_MIDGREY};
  font-weight: 600;
  font-size: 16px;
  line-height: 19px;
`;

const width = 62;
const strokeWidth = 8;
const center = width / 2;
const radius = (width - strokeWidth) / 2;
const C = 2 * Math.PI * radius;

const StyledSVG = styled.svg`
  transform: rotate(-90deg);
`;

const InnerCircle = styled.circle`
  fill: ${COLORS.LIGHTGREY};
  stroke: ${COLORS.GREY_DE};
  stroke-width: ${strokeWidth};
`;

const OuterCircle = styled.circle`
  stroke: ${props => props.theme.palette.primary.main};
  stroke-width: ${strokeWidth};
  stroke-dasharray: ${C};
  stroke-dashoffset: ${C};
  transition: stroke-dashoffset 2s ease;
`;

export const CircleMeter = ({ percent }) => {
  if (percent > 100 || percent < 0) {
    // eslint-disable-next-line no-console
    console.warn(percent, 'is not a valid percent');
  }
  const offsetStyle = {
    strokeDashoffset: C - (percent / 100) * C,
  };
  return (
    <Circle>
      <StyledSVG width={width} height={width} viewBox={`0 0 ${width} ${width}`} fill="none">
        <InnerCircle cx={center} cy={center} r={radius} />
        <OuterCircle cx={center} cy={center} r={radius} style={offsetStyle} />
      </StyledSVG>
      <PercentText>{percent}%</PercentText>
    </Circle>
  );
};

CircleMeter.propTypes = {
  percent: PropTypes.number.isRequired,
};
