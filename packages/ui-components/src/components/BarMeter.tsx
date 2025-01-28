import React from 'react';
import styled from 'styled-components';
import Typography from '@material-ui/core/Typography';

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
  color: ${props => props.theme.palette.text.secondary};
  font-weight: 500;
  font-size: 0.6875rem;
  line-height: 0.8125rem;
  text-transform: uppercase;
  margin-bottom: 0.625rem;
`;

const LegendValue = styled.span`
  color: ${props => props.theme.palette.text.primary};
`;

interface BarMeterProps {
  value: number;
  total: number;
  legend?: string;
}

export const BarMeter = ({ value, total, legend = 'Value' }: BarMeterProps) => (
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
