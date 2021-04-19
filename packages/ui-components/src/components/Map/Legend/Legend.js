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
  padding: 0.3rem;
  margin: 0.625rem auto;
  border-radius: 3px;
  cursor: auto;
  color: #eeeeee;
  background-color: rgba(43, 45, 56, 0.8);
  box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.3);
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

export const Legend = React.memo(({ measureOptions, className, setValueHidden, hiddenValues }) => {
  if (!measureOptions) {
    return null;
  }

  const displayedLegends = measureOptions.filter(({ type }) => type !== MEASURE_TYPE_RADIUS);
  const hasIconLayer = measureOptions.some(l => l.type === MEASURE_TYPE_ICON);
  const hasRadiusLayer = measureOptions.some(l => l.type === MEASURE_TYPE_RADIUS);
  const hasColorLayer = measureOptions.some(l => coloredMeasureTypes.includes(l.type));

  return (
    <LegendFrame className={className}>
      {displayedLegends.map(measureOption => {
        const { type } = measureOption;
        const LegendComponent = getLegendComponent(type);

        return (
          <LegendComponent
            key={measureOption.key}
            hasIconLayer={hasIconLayer}
            hasRadiusLayer={hasRadiusLayer}
            hasColorLayer={hasColorLayer}
            measureOptions={measureOption}
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
  measureOptions: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    }),
  ),
  className: PropTypes.string,
};

Legend.defaultProps = {
  measureOptions: null,
  className: null,
  hiddenValues: {},
  setValueHidden: null,
};
