import React from 'react';
import styled from 'styled-components';
import Typography from '@material-ui/core/Typography';

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
const circumference = 2 * Math.PI * radius;

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
  stroke-dasharray: ${circumference};
  stroke-dashoffset: ${circumference};
  transition: stroke-dashoffset 2s ease;
`;

interface CircleMeterProps {
  value: number;
  total?: number;
}

export const CircleMeter = ({ value, total = 1 }: CircleMeterProps) => {
  let fraction = value / total;
  const percent = Math.round(fraction * 100);

  if (value > total) {
    // eslint-disable-next-line no-console
    console.warn('value should not be greater than total');
    fraction = 1; // this will show a full circle
  }

  const offsetStyle = {
    strokeDashoffset: circumference - fraction * circumference,
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
