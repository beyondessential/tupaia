/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import MuiButton from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';

const LegendContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: ${props => (props.position === 'bottom' ? 'center' : 'flex-start')};
  padding: ${props => (props.position === 'bottom' ? '1rem 0 0 3.5rem' : '0 0 2rem 0')};
`;

const PieLegendContainer = styled(LegendContainer)`
  padding: 0;
`;

const getLegendTextColor = (theme, isExporting) => {
  if (isExporting) {
    return '#2c3236';
  }

  if (theme.palette.type === 'light') {
    return theme.palette.text.primary;
  }
  return 'white';
};

const LegendItem = styled(({ isExporting, ...props }) => <MuiButton {...props} />)`
  text-align: left;
  font-size: 0.75rem;
  padding-bottom: 0;
  padding-top: 0;
  margin-right: 1.2rem;

  .MuiButton-label {
    display: flex;
    align-items: center;
    color: ${({ theme, isExporting }) => getLegendTextColor(theme, isExporting)};
  }

  &.Mui-disabled {
    color: ${({ theme, isExporting }) => getLegendTextColor(theme, isExporting)};
  }

  // preview styles
  &.preview {
    font-size: 0.5rem;
    padding-bottom: 0.1rem;
    padding-top: 0.1rem;
    margin-right: 0;
  }
`;

const TooltipContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding-bottom: 0.3rem;
  padding-top: 0.3rem;
`;

const Box = styled.span`
  display: block;
  width: 1.25rem;
  height: 1.25rem;
  margin-right: 0.625rem;
  border-radius: 3px;

  // preview styles
  &.preview {
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

export const getPieLegend = ({ chartConfig = {}, isEnlarged, isExporting, legendPosition }) => ({
  payload,
}) => (
  <PieLegendContainer position={legendPosition}>
    {payload.map(({ color, value }) => (
      <LegendItem
        key={value}
        isExporting={isExporting}
        className={isEnlarged ? 'enlarged' : 'preview'}
        disabled
      >
        <Box className={isEnlarged ? 'enlarged' : 'preview'} style={{ background: color }} />
        <Text>{getDisplayValue(chartConfig, value)}</Text>
      </LegendItem>
    ))}
  </PieLegendContainer>
);

export const getCartesianLegend = ({
  chartConfig,
  onClick,
  getIsActiveKey,
  isExporting,
  legendPosition,
}) => ({ payload }) => (
  <LegendContainer position={legendPosition}>
    {payload.map(({ color, value, dataKey }) => {
      return (
        <LegendItem
          key={value}
          onClick={() => onClick(dataKey)}
          isExporting={isExporting}
          style={{ textDecoration: getIsActiveKey(value) ? '' : 'line-through' }}
        >
          <Tooltip title="Click to filter data" placement="top" arrow>
            <TooltipContainer>
              <Box style={{ background: color }} />
              <Text>{getDisplayValue(chartConfig, value)}</Text>
            </TooltipContainer>
          </Tooltip>
        </LegendItem>
      );
    })}
  </LegendContainer>
);
