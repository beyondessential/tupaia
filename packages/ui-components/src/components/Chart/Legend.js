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
  padding-bottom: 1rem;

  // non enlarged styles
  &.non-enlarged {
    align-items: flex-start;
  }
`;

const LegendItem = styled(({ isEnlarged, ...props }) => <MuiButton {...props} />)`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  text-align: left;
  font-size: 0.75rem;
  padding-bottom: 0.3rem;
  padding-top: 0.3rem;
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

  // non enlarged styles
  &.non-enlarged {
    font-size: 0.5rem;
    padding-bottom: 0.1rem;
    padding-top: 0.1rem;
    margin-right: 0;
    width: 50%;

    .MuiButton-label {
      display: flex;
      align-items: flex-start;
      color: ${({ theme }) =>
        theme.palette.type === 'light' ? theme.palette.text.primary : 'white'};
    }

    &.Mui-disabled {
      color: ${({ theme }) =>
        theme.palette.type === 'light' ? theme.palette.text.primary : 'white'};
    }
  }
`;

const Box = styled.span`
  display: block;
  width: 1.25rem;
  height: 1.25rem;
  margin-right: 0.625rem;
  border-radius: 3px;

  // non enlarged styles
  &.non-enlarged {
    width: 0.8rem;
    min-width: 0.8rem;
    height: 0.8rem;
    margin-right: 0.4rem;
  }
`;

const Text = styled.span`
  line-height: 1.4;
`;

const getDisplayValue = (chartConfig, value) => chartConfig[value]?.label || value;

export const getPieLegend = ({ chartConfig = {}, isEnlarged }) => ({ payload }) => (
  <LegendContainer className={isEnlarged ? 'enlarged' : 'non-enlarged'}>
    {payload.map(({ color, value }) => (
      <LegendItem key={value} className={isEnlarged ? 'enlarged' : 'non-enlarged'} disabled>
        <Box className={isEnlarged ? 'enlarged' : 'non-enlarged'} style={{ background: color }} />
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
