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
  padding: 0 0 2rem 0;
`;

const LegendItem = styled(MuiButton)`
  margin-right: 1.2rem;
  font-size: 0.75rem;

  .MuiButton-label {
    display: flex;
    align-items: center;
  }

  &.Mui-disabled {
    color: inherit;
  }
`;

const Box = styled.span`
  display: block;
  width: 1.25rem;
  height: 1.25rem;
  margin-right: 0.625rem;
  border-radius: 3px;
`;

const Text = styled.span`
  line-height: 1.4;
`;

const getDisplayValue = (chartConfig, value) => {
  if (value in chartConfig && 'label' in chartConfig[value]) {
    return chartConfig[value].label;
  }
  return value;
};

export const getPieLegend = () => ({ payload }) => (
  <LegendContainer style={{ padding: 0, marginBottom: -10 }}>
    {payload.map(({ color, value }) => (
      <LegendItem key={value} disabled>
        <Box style={{ background: color }} />
        <Text>{value}</Text>
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
