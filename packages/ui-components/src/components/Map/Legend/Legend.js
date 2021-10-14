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
    className,
    measureInfo: baseMeasureInfo,
    setValueHidden,
    hiddenValues,
    currentMapOverlayIds,
    displayedMapOverlayIds,
    seriesesKey = 'serieses',
  }) => {
    if (Object.keys(baseMeasureInfo).length === 0) {
      return null;
    }

    const measureInfo = currentMapOverlayIds.reduce((results, mapOverlayId) => {
      const serieses = baseMeasureInfo[mapOverlayId][seriesesKey].filter(
        ({ type, hideFromLegend, values = [] }) =>
          ![MEASURE_TYPE_RADIUS, MEASURE_TYPE_POPUP_ONLY].includes(type) &&
          hideFromLegend !== true &&
          // Spetrum legend has values = []
          (values.length === 0 || values.filter(value => !value?.hideFromLegend).length > 0),
      );
      return { ...results, [mapOverlayId]: { serieses } };
    }, {});

    const legendTypes = currentMapOverlayIds
      .map(mapOverlayId => measureInfo[mapOverlayId].serieses)
      .flat()
      .map(({ type }) => type);
    const legendsHaveSameType = legendTypes.length > 1 && new Set(legendTypes).size === 1;

    return (
      <>
        {currentMapOverlayIds.map(mapOverlayId => {
          const { serieses } = measureInfo[mapOverlayId];

          const hasIconLayer = serieses.some(l => l.type === MEASURE_TYPE_ICON);
          const hasRadiusLayer = serieses.some(l => l.type === MEASURE_TYPE_RADIUS);
          const hasColorLayer = serieses.some(l => coloredMeasureTypes.includes(l.type));
          const isDisplayed = displayedMapOverlayIds.includes(mapOverlayId);

          return serieses.map(series => {
            const { type } = series;
            const LegendComponent = getLegendComponent(type);
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
  measureInfo: PropTypes.object.isRequired,
  className: PropTypes.string,
  hiddenValues: PropTypes.object,
  setValueHidden: PropTypes.func,
  displayedMapOverlayIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  currentMapOverlayIds: PropTypes.arrayOf(PropTypes.string).isRequired,
};

Legend.defaultProps = {
  className: null,
  hiddenValues: {},
  setValueHidden: null,
};
