import React from 'react';
import { CartesianChartConfig } from '@tupaia/types';
import styled from 'styled-components';
import { TooltipPayload } from 'recharts';
import Tooltip from '@material-ui/core/Tooltip';
import { LegendPosition } from '../../types';
import { isMobile } from '../../utils';
import { LegendItem } from './LegendItem';

const LegendContainer = styled.div<{
  $position?: LegendPosition;
}>`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  flex-direction: row;
  // Add more padding at the bottom for exports
  padding: ${props => (props.$position === 'bottom' ? '1em 0 0 3.5em' : '0 0 3em 0')};
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

interface CartesianLegendProps {
  chartConfig: CartesianChartConfig['chartConfig'];
  onClick: Function;
  getIsActiveKey: Function;
  isExporting?: boolean;
  legendPosition?: LegendPosition;
}

export const getCartesianChartLegend =
  ({ chartConfig, onClick, getIsActiveKey, isExporting, legendPosition }: CartesianLegendProps) =>
  ({ payload }: any) => {
    const isMobileSize = isMobile(isExporting);
    return (
      <LegendContainer $position={isExporting ? 'top' : legendPosition}>
        {payload.map(({ color, value, dataKey }: TooltipPayload) => {
          // check the type here because according to TooltipPayload, value can be a number or a readonly string | number array
          const displayValue = (typeof value === 'string' && chartConfig?.[value]?.label) || value;

          return (
            <LegendItem
              // parse to a string because the key can't be an array
              key={String(value)}
              onClick={() => onClick(dataKey)}
              isExporting={isExporting}
              className={isMobileSize ? 'small' : 'enlarged'}
              style={{ textDecoration: getIsActiveKey(value) ? '' : 'line-through' }}
            >
              <Tooltip title="Click to filter data" placement="top" arrow>
                <TooltipContainer>
                  <Box
                    className={isMobileSize ? 'small' : 'enlarged'}
                    style={{ background: color }}
                  />
                  <Text>{displayValue}</Text>
                </TooltipContainer>
              </Tooltip>
            </LegendItem>
          );
        })}
      </LegendContainer>
    );
  };
