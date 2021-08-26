/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';
import {
  MEASURE_TYPE_COLOR,
  MEASURE_TYPE_ICON,
  MEASURE_TYPE_RADIUS,
  MEASURE_TYPE_SHADED_SPECTRUM,
  MEASURE_TYPE_SPECTRUM,
} from '../utils';
import { MarkerLegend } from './MarkerLegend';
import { SpectrumLegend } from './SpectrumLegend';

const LegendFrame = styled.div`
  padding: 0.6rem;
  margin: 0.6rem auto;
  cursor: auto;
  color: ${props => props.theme.palette.text.primary};
  background-color: ${({ theme }) =>
    theme.palette.type === 'light' ? 'rgba(255, 255, 255, 0.85)' : 'rgba(43, 45, 56, 0.85)'};
  border-radius: 3px;
`;

const coloredMeasureTypes = [
  MEASURE_TYPE_COLOR,
  MEASURE_TYPE_SPECTRUM,
  MEASURE_TYPE_SHADED_SPECTRUM,
];

const NullLegend = () => null;

const getLegendComponent = measureType => {
  switch (measureType) {
    case MEASURE_TYPE_SHADED_SPECTRUM:
    case MEASURE_TYPE_SPECTRUM:
      return SpectrumLegend;
    case MEASURE_TYPE_RADIUS:
      return NullLegend;
    default:
      return MarkerLegend;
  }
};

export const Legend = React.memo(({ serieses, className, setValueHidden, hiddenValues }) => {
  if (!serieses) {
    return null;
  }

  const displayedLegends = serieses.filter(({ type }) => type !== MEASURE_TYPE_RADIUS);
  const hasIconLayer = serieses.some(l => l.type === MEASURE_TYPE_ICON);
  const hasRadiusLayer = serieses.some(l => l.type === MEASURE_TYPE_RADIUS);
  const hasColorLayer = serieses.some(l => coloredMeasureTypes.includes(l.type));

  return (
    <LegendFrame className={className}>
      {displayedLegends.map(series => {
        const { type } = series;
        const LegendComponent = getLegendComponent(type);

        return (
          <LegendComponent
            key={series.key}
            hasIconLayer={hasIconLayer}
            hasRadiusLayer={hasRadiusLayer}
            hasColorLayer={hasColorLayer}
            series={series}
            setValueHidden={setValueHidden}
            hiddenValues={hiddenValues}
          />
        );
      })}
    </LegendFrame>
  );
});

Legend.propTypes = {
  setValueHidden: PropTypes.func,
  hiddenValues: PropTypes.object,
  serieses: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    }),
  ),
  className: PropTypes.string,
};

Legend.defaultProps = {
  serieses: null,
  className: null,
  hiddenValues: {},
  setValueHidden: null,
};
