import React from 'react';
import { Tooltip } from 'react-leaflet';
import styled from 'styled-components';
import { PopupDataItemList } from './PopupDataItemList';
import { MeasureData, Series } from '../types';

const Heading = styled.span<{
  hasMeasureValue: boolean;
}>`
  text-align: center;
  font-weight: ${props => (props.hasMeasureValue ? 'bold' : 'normal')};
`;

const Grid = styled.div`
  display: grid;
`;

interface AreaTooltipProps {
  permanent?: boolean;
  sticky?: boolean;
  orgUnitName?: string;
  hasMeasureValue?: boolean;
  serieses?: Series[];
  orgUnitMeasureData?: MeasureData;
  text?: string;
}

export const AreaTooltip = ({
  permanent = false,
  sticky = false,
  orgUnitName,
  hasMeasureValue = false,
  serieses = [],
  orgUnitMeasureData = {} as MeasureData,
  text,
}: AreaTooltipProps) => {
  return (
    <Tooltip
      // workaround for tooltips not re-rendering when permanent changes (see: https://stackoverflow.com/questions/67610706/dynamic-permanent-property-for-tooltip-leaflet)
      key={`${orgUnitName}-${permanent}-${sticky}`}
      pane="tooltipPane"
      direction="auto"
      opacity={1}
      sticky={sticky}
      permanent={permanent}
      interactive={permanent}
    >
      {text ? (
        <Grid>{text}</Grid>
      ) : (
        <Grid>
          <Heading key={0} hasMeasureValue={hasMeasureValue}>
            {orgUnitName}
          </Heading>
          {hasMeasureValue && (
            <PopupDataItemList key={1} serieses={serieses} data={orgUnitMeasureData} />
          )}
        </Grid>
      )}
    </Tooltip>
  );
};
