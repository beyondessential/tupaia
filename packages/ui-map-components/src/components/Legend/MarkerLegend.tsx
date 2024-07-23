/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled, { css } from 'styled-components';
import { useTheme } from '@material-ui/core/styles';
import MuiBox from '@material-ui/core/Box';
import { IconKey } from '@tupaia/types';
import { UNKNOWN_COLOR } from '../../constants';
import { SeriesValue, MarkerLegendProps, MarkerSeries, Value } from '../../types';
import {
  DEFAULT_ICON,
  HIDDEN_ICON,
  LEGEND_COLOR_ICON,
  LEGEND_RADIUS_ICON,
  LEGEND_SHADING_ICON,
  getMarkerForOption,
} from '../Markers/markerIcons';
import {
  MEASURE_TYPE_COLOR,
  MEASURE_TYPE_ICON,
  MEASURE_TYPE_SHADING,
  MEASURE_VALUE_NULL,
  MEASURE_VALUE_OTHER,
} from '../../utils';
import { LegendEntry } from './LegendEntry';

const Container = styled(MuiBox)<{
  $isExport?: boolean;
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;

  ${({ $isExport, theme }) =>
    !$isExport &&
    css`
      ${theme.breakpoints.down('sm')} {
        flex-direction: column;
        align-items: flex-start;
      }
    `}
`;

/**
 * Icon layers can be set to hide some values from the map entirely - but if we're showing
 * radius values for them, we should still put them in the legend!
 * If a specific value has been set, assume that it's intentional that it's been hidden,
 * and hide the radius as well. But, if the hidden icon is 'other', go ahead and add it to
 * the legend and show the radius.
 */
const isHiddenOtherIcon = ({ value, icon }: SeriesValue) => {
  return value === MEASURE_VALUE_OTHER && icon === HIDDEN_ICON;
};

const getMarkerColor = (value: SeriesValue, type: MarkerSeries['type'], hasColorLayer: boolean) => {
  const theme = useTheme();

  if (type === MEASURE_TYPE_COLOR) {
    // if this layer is providing color, of course show the color
    return value.color;
  }
  if (hasColorLayer) {
    // if a different layer is providing color, show the legend icons as white or dark grey
    return theme.palette.type === 'light' ? theme.palette.text.primary : 'white';
  }

  // if we have a color that isn't being overridden elsewhere, show it
  return value.color || UNKNOWN_COLOR;
};

const getLegendMarkerForValue = (
  value: SeriesValue,
  type: MarkerSeries['type'],
  hasIconLayer: MarkerLegendProps['hasIconLayer'],
  hasRadiusLayer: MarkerLegendProps['hasRadiusLayer'],
  hasColorLayer: MarkerLegendProps['hasColorLayer'],
  defaultIcon: IconKey | null = null,
) => {
  const { icon } = value;
  const color = getMarkerColor(value, type, hasColorLayer);

  if (type === MEASURE_TYPE_ICON) {
    if (hasRadiusLayer && isHiddenOtherIcon(value)) {
      // this is a radius/icon combo measure -- show a ring for the 'no icon' option
      return getMarkerForOption(LEGEND_RADIUS_ICON, color);
    }
    if (hasColorLayer) {
      // color info is from another layer, so show the icons all in white
      return getMarkerForOption(icon, color);
    }
    // straight up icons! just show them
    return getMarkerForOption(icon, color);
  }
  if (type === MEASURE_TYPE_SHADING) {
    // show squares; icons will be displayed in another legend
    return getMarkerForOption(LEGEND_SHADING_ICON, color);
  }
  if (hasIconLayer) {
    // show circles; icons will be displayed in another legend
    return getMarkerForOption(LEGEND_COLOR_ICON, color);
  }
  if (hasRadiusLayer) {
    // show rings, as we are indicating radius colors
    return getMarkerForOption(LEGEND_RADIUS_ICON, color);
  }

  if (defaultIcon) {
    return getMarkerForOption(defaultIcon, color);
  }
  // color is the only measure here - show pins
  return getMarkerForOption(DEFAULT_ICON, color);
};

export const MarkerLegend = React.memo(
  ({
    series,
    setValueHidden,
    hiddenValues = {},
    hasIconLayer,
    hasRadiusLayer,
    hasColorLayer,
    isExport,
  }: MarkerLegendProps) => {
    const { type, values, key: dataKey, valueMapping } = series;
    const icon = 'icon' in series ? series.icon : null;

    const keys = values
      .filter(v => !v.hideFromLegend)
      .filter(v => hasRadiusLayer || !isHiddenOtherIcon(v)) // only show hidden icons in legend if paired with radius
      .filter(v => v.value !== MEASURE_VALUE_NULL && v.value !== null) // we will be rendering this below
      .map(v => {
        const marker = getLegendMarkerForValue(
          v,
          type,
          hasIconLayer,
          hasRadiusLayer,
          hasColorLayer,
          icon,
        );
        return (
          <LegendEntry
            key={v.name}
            dataKey={dataKey}
            marker={marker}
            label={v.name}
            value={v.value as Value}
            hiddenValues={hiddenValues}
            onClick={setValueHidden}
          />
        );
      });

    // Sometimes we want to group Null + No = No.
    // So we don't want to render 'No data' legend if that's the case
    const hasGroupedLegendIncludingNull = values.some(({ value }) => {
      if (Array.isArray(value)) {
        return value.some(innerValue => innerValue === MEASURE_VALUE_NULL);
      }

      return false;
    });

    let nullKey = null;
    const nullItem = valueMapping?.null;

    if (!hasGroupedLegendIncludingNull && nullItem && !nullItem.hideFromLegend) {
      nullKey = (
        <LegendEntry
          marker={getLegendMarkerForValue(
            nullItem,
            type,
            hasIconLayer,
            hasRadiusLayer,
            hasColorLayer,
            icon,
          )}
          dataKey={dataKey}
          label={nullItem.name}
          hiddenValues={hiddenValues}
          onClick={setValueHidden}
          value={null}
        />
      );
    }

    return (
      <Container $isExport={isExport}>
        {keys}
        {nullKey}
      </Container>
    );
  },
);
