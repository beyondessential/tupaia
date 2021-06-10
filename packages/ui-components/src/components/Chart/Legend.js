/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import MuiButton from '@material-ui/core/Button';

const LegendContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  padding-bottom: ${props => (props.isEnlarged ? '2rem' : '0.5rem')};
`;

const LegendItem = styled(({ isEnlarged, ...props }) => <MuiButton {...props} />)`
  font-size: ${({ isEnlarged }) => (isEnlarged ? '0.75rem' : '0.5rem')};
  padding-bottom: ${({ isEnlarged }) => (isEnlarged ? '0.3rem' : '0')};
  margin-right: 1.2rem;

  .MuiButton-label {
    display: flex;
    align-items: center;
    color: ${({ theme }) =>
      theme.palette.type === 'light' ? theme.palette.text.primary : 'white'};
  }

  &.Mui-disabled {
    color: ${({ theme }) =>
      theme.palette.type === 'light' ? theme.palette.text.primary : 'white'};
  }
`;

const Box = styled.span`
  display: block;
  width: ${({ isEnlarged }) => (isEnlarged ? '1.25rem' : '0.8rem')};
  height: ${({ isEnlarged }) => (isEnlarged ? '1.25rem' : '0.8rem')};
  margin-right: ${({ isEnlarged }) => (isEnlarged ? '0.625rem' : '0.3rem')};
  border-radius: 3px;
`;

const Text = styled.span`
  line-height: 1.4;
`;

const getDisplayValue = (chartConfig, value) => chartConfig[value]?.label || value;

export const getPieLegend = ({ chartConfig = {}, isEnlarged }) => ({ payload }) => (
  <LegendContainer style={{ padding: 0, marginBottom: -10 }}>
    {payload.map(({ color, value }) => (
      <LegendItem key={value} isEnlarged={isEnlarged} disabled>
        <Box style={{ background: color }} />
        <Text>{getDisplayValue(chartConfig, value)}</Text>
      </LegendItem>
    ))}
  </LegendContainer>
);

export const getCartesianLegend = ({ chartConfig, onClick, getIsActiveKey, isExporting }) => ({
  payload,
}) => (
  <LegendContainer>
    {payload.map(({ color, value, dataKey }) => {
      return (
        <LegendItem
          key={value}
          onClick={() => onClick(dataKey)}
          style={{ textDecoration: getIsActiveKey(value) ? '' : 'line-through' }}
        >
          <Box style={{ background: color }} />
          <Text>{getDisplayValue(chartConfig, value)}</Text>
        </LegendItem>
      );
    })}
  </LegendContainer>
);
