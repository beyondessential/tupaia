/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { PieChartConfig } from '@tupaia/types';
import { TooltipPayload } from 'recharts';
import { formatDataValueByType } from '@tupaia/utils';
import { LegendPosition } from '../../types';
import { isMobile } from '../../utils';
import { LegendItem } from './LegendItem';
import styled from 'styled-components';

const PieLegendContainer = styled.div<{
  $position?: LegendPosition;
  $isExporting?: boolean;
}>`
  display: flex;
  flex-wrap: ${props => (props.$isExporting ? 'nowrap' : 'wrap')};
  justify-content: ${props => (props.$position === 'bottom' ? 'center' : 'flex-start')};
  flex-direction: ${props => (props.$isExporting ? 'column' : 'row')};
  padding: 0;
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

  // small styles
  &.small {
    width: 0.8rem;
    min-width: 0.8rem;
    height: 0.8rem;
    margin-right: 0.4rem;
  }
`;

const Text = styled.span`
  line-height: 1.4;
`;

interface PieLegendProps {
  isEnlarged?: boolean;
  isExporting?: boolean;
  legendPosition?: LegendPosition;
  config: PieChartConfig;
}

const getPieLegendDisplayValue = (
  value: TooltipPayload['value'],
  item: any,
  config: PieLegendProps['config'],
  isEnlarged?: PieLegendProps['isEnlarged'],
  isMobileSize?: boolean,
) => {
  const metadata = item[`${value}_metadata`];
  const labelSuffix = formatDataValueByType({ value: item.value, metadata }, config.valueType);

  // on mobile the legend will show the actual formatDataValueByType after the label value
  return isMobileSize && isEnlarged ? `${value} ${labelSuffix}` : value;
};

export const getPieChartLegend =
  ({ isEnlarged, isExporting, legendPosition, config }: PieLegendProps) =>
  ({ payload }: any) => {
    const isMobileSize = isMobile(isExporting);
    return (
      <PieLegendContainer $position={legendPosition} $isExporting={isExporting}>
        {payload.map(({ color, value, payload: item }: TooltipPayload) => {
          const displayValue = getPieLegendDisplayValue(
            value,
            item,
            config,
            isEnlarged,
            isMobileSize,
          );

          return (
            <LegendItem
              key={String(value)}
              isExporting={isExporting}
              className={isEnlarged && !isMobileSize ? 'enlarged' : 'small'}
              disabled
            >
              <TooltipContainer>
                <Box
                  className={isEnlarged && !isMobileSize ? 'enlarged' : 'small'}
                  style={{ background: color }}
                />
                <Text>{displayValue}</Text>
              </TooltipContainer>
            </LegendItem>
          );
        })}
      </PieLegendContainer>
    );
  };
