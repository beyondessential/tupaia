/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import styled from 'styled-components';
import Typography from '@material-ui/core/Typography';
import PropTypes from 'prop-types';
import React from 'react';

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
  color: ${props => props.theme.palette.text.secondary};
  font-weight: 600;
  font-size: 1rem;
  line-height: 1.2rem;
`;

const width = 62;
const strokeWidth = 8;
const center = width / 2;
const radius = (width - strokeWidth) / 2;
const C = 2 * Math.PI * radius;

const StyledSVG = styled.svg`
  transform: rotate(-90deg);
`;

const innerCircleFillColor = '#F9F9F9';

const InnerCircle = styled.circle`
  fill: ${innerCircleFillColor};
  stroke: ${props => props.theme.palette.grey['400']};
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
