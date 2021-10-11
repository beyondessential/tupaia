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
  MEASURE_TYPE_POPUP_ONLY,
} from '../utils';
import { MarkerLegend } from './MarkerLegend';
import { SpectrumLegend } from './SpectrumLegend';

const LegendFrame = styled.div`
  display: flex;
  width: fit-content;
  padding: 0.6rem;
  margin: 0.6rem auto;
  cursor: auto;
  color: ${props => props.theme.palette.text.primary};
  background-color: ${({ theme }) =>
    theme.palette.type === 'light' ? 'rgba(255, 255, 255, 0.85)' : 'rgba(43, 45, 56, 0.85)'};
  border-radius: 3px;
  opacity: ${props => (props.isDisplayed ? '100%' : '20%')};
`;

const LegendName = styled.div`
  margin: auto 0.6rem;
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

export const Legend = React.memo(
  ({
    serieses,
    className,
    setValueHidden,
    hiddenValues,
    currentMeasureIds,
    displayedMeasureIds,
  }) => {
    const displayedLegends = serieses?.filter(
      ({ type, hideFromLegend, values = [] }) =>
        ![MEASURE_TYPE_RADIUS, MEASURE_TYPE_POPUP_ONLY].includes(type) &&
        hideFromLegend !== true &&
        values.filter(value => !value?.hideFromLegend).length > 0,
    );

    if (!serieses || displayedLegends.length === 0) {
      return null;
    }

    const legendTypes = displayedLegends.map(displayedLegend => displayedLegend.type);
    const legendsHaveSameType = legendTypes.length > 1 && new Set(legendTypes).size === 1;
    return (
      <>
        {currentMeasureIds.map(measureIds => {
          const displayedSerieses = displayedLegends.filter(legend =>
            measureIds.includes(legend.key),
          );
          const hasIconLayer = displayedSerieses.some(l => l.type === MEASURE_TYPE_ICON);
          const hasRadiusLayer = displayedSerieses.some(l => l.type === MEASURE_TYPE_RADIUS);
          const hasColorLayer = displayedSerieses.some(l => coloredMeasureTypes.includes(l.type));

          return displayedSerieses.map(series => {
            const { type } = series;
            const LegendComponent = getLegendComponent(type);
            const isDisplayed = displayedMeasureIds.includes(series.key);
            return (
              <LegendFrame key={series.key} className={className} isDisplayed={isDisplayed}>
                {legendsHaveSameType && <LegendName>{`${series.name}: `}</LegendName>}
                <LegendComponent
                  key={series.key}
                  hasIconLayer={hasIconLayer}
                  hasRadiusLayer={hasRadiusLayer}
                  hasColorLayer={hasColorLayer}
                  series={series}
                  setValueHidden={setValueHidden}
                  hiddenValues={hiddenValues}
                />
              </LegendFrame>
            );
          });
        })}
      </>
    );
  },
);

Legend.propTypes = {
  displayedMeasureIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  setValueHidden: PropTypes.func,
  hiddenValues: PropTypes.object,
  serieses: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    }),
  ),
  className: PropTypes.string,
  currentMeasureIds: PropTypes.array.isRequired,
};

Legend.defaultProps = {
  serieses: null,
  className: null,
  hiddenValues: {},
  setValueHidden: null,
};
