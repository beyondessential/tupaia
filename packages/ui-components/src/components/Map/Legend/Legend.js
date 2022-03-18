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
  cursor: auto;
  color: ${props => props.theme.palette.text.primary};
  background-color: ${({ theme }) =>
    theme.palette.type === 'light' ? 'rgba(255, 255, 255, 0.85)' : 'rgba(43, 45, 56, 0.85)'};
  border-radius: 3px;
  opacity: ${props => (props.isDisplayed ? '100%' : '20%')};
  margin: 0.6rem auto;

  ${p => p.theme.breakpoints.down('sm')} {
    margin: 0.6rem;
  }
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
    currentMapOverlayCodes,
    displayedMapOverlayCodes,
    seriesesKey,
    SeriesContainer,
    SeriesDivider,
  }) => {
    if (Object.keys(baseMeasureInfo).length === 0) {
      return null;
    }

    const measureInfo = currentMapOverlayCodes.reduce((results, mapOverlayCode) => {
      // measure info for mapOverlayCode may not exist when location changes.
      const baseSerieses = baseMeasureInfo[mapOverlayCode]?.[seriesesKey] || [];
      const serieses = baseSerieses.filter(
        ({ type, hideFromLegend, values = [] }) =>
          ![MEASURE_TYPE_RADIUS, MEASURE_TYPE_POPUP_ONLY].includes(type) &&
          hideFromLegend !== true &&
          // Spetrum legend has values = []
          (values.length === 0 || values.filter(value => !value?.hideFromLegend).length > 0),
      );
      return { ...results, [mapOverlayCode]: { serieses } };
    }, {});

    const legendTypes = currentMapOverlayCodes
      .map(mapOverlayCode => measureInfo[mapOverlayCode].serieses)
      .flat()
      .map(({ type }) => type);
    const legendsHaveSameType = legendTypes.length > 1 && new Set(legendTypes).size === 1;

    return (
      <>
        {currentMapOverlayCodes.map(mapOverlayCode => {
          const { serieses } = measureInfo[mapOverlayCode];
          const baseSerieses = baseMeasureInfo[mapOverlayCode]?.[seriesesKey] || [];
          const hasIconLayer = baseSerieses.some(l => l.type === MEASURE_TYPE_ICON);
          const hasRadiusLayer = baseSerieses.some(l => l.type === MEASURE_TYPE_RADIUS);
          const hasColorLayer = baseSerieses.some(l => coloredMeasureTypes.includes(l.type));
          const isDisplayed =
            !displayedMapOverlayCodes || displayedMapOverlayCodes.includes(mapOverlayCode);

          return serieses.map((series, index) => {
            const { type } = series;
            const LegendComponent = getLegendComponent(type);
            return (
              <>
                <SeriesContainer key={series.key} className={className} isDisplayed={isDisplayed}>
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
                </SeriesContainer>
                {index < serieses.length - 1 && SeriesDivider && <SeriesDivider />}
              </>
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
  displayedMapOverlayCodes: PropTypes.arrayOf(PropTypes.string),
  currentMapOverlayCodes: PropTypes.arrayOf(PropTypes.string).isRequired,
  seriesesKey: PropTypes.string,
  SeriesContainer: PropTypes.node,
  SeriesDivider: PropTypes.node,
};

Legend.defaultProps = {
  className: null,
  displayedMapOverlayCodes: null,
  hiddenValues: {},
  setValueHidden: null,
  seriesesKey: 'serieses',
  SeriesContainer: LegendFrame,
  SeriesDivider: null,
};
