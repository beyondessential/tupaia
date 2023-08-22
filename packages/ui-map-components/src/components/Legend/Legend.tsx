/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { MarkerLegend } from './MarkerLegend';
import { SpectrumLegend } from './SpectrumLegend';
import { MeasureType } from '@tupaia/types';
import { LegendProps as BaseLegendProps, Series, MeasureTypeLiteral } from '../../types';

const LegendFrame = styled.div<{
  isDisplayed: boolean;
}>`
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
  MeasureType.COLOR,
  MeasureType.SPECTRUM,
  MeasureType.SHADED_SPECTRUM,
];

// This is a workaround for type errors we get when trying to use Array.includes with a subset of a union type. This solution comes from https://github.com/microsoft/TypeScript/issues/51881
const checkMeasureType = (item: MeasureTypeLiteral, subset: MeasureTypeLiteral[]) =>
  (subset as ReadonlyArray<MeasureTypeLiteral>).includes(item);

const NullLegend = () => null;

const getLegendComponent = (measureType: MeasureTypeLiteral) => {
  switch (measureType) {
    case MeasureType.SHADED_SPECTRUM:
    case MeasureType.SPECTRUM:
      return SpectrumLegend;
    case MeasureType.RADIUS:
      return NullLegend;
    default:
      return MarkerLegend;
  }
};

interface LegendProps extends BaseLegendProps {
  className?: string;
  measureInfo: {
    [mapOverlayCode: string]: {
      [seriesesKey: string]: Series[];
    };
  };
  currentMapOverlayCodes: string[];
  displayedMapOverlayCodes?: string[];
  seriesesKey?: string;
  SeriesContainer?: React.ComponentType<any>;
  SeriesDivider?: React.ComponentType<any>;
}

export const Legend = React.memo(
  ({
    className,
    measureInfo: baseMeasureInfo,
    setValueHidden,
    hiddenValues = {},
    currentMapOverlayCodes,
    displayedMapOverlayCodes,
    seriesesKey = 'serieses',
    SeriesContainer = LegendFrame,
    SeriesDivider,
  }: LegendProps) => {
    if (Object.keys(baseMeasureInfo).length === 0) {
      return null;
    }

    const measureInfo = currentMapOverlayCodes.reduce((results, mapOverlayCode) => {
      // measure info for mapOverlayCode may not exist when location changes.
      const baseSerieses = baseMeasureInfo[mapOverlayCode]?.[seriesesKey] || [];
      const serieses = baseSerieses.filter(
        ({ type, hideFromLegend, values = [], min, max, noDataColour }: Series) => {
          const seriesType = type as MeasureTypeLiteral;
          // if type is radius or popup-only, don't create a legend
          if (checkMeasureType(seriesType, [MeasureType.RADIUS, MeasureType.POPUP_ONLY]))
            return false;

          // if hideFromLegend is true, don't create a legend
          if (hideFromLegend) return false;

          // if type is spectrum or shaded-spectrum, only create a legend if min and max are set OR noDataColour is set. If noDataColour is not set, that means hideNullFromLegend has been set as true in the map overlay config. Spectrum legends 'values' property will always be []
          if (checkMeasureType(seriesType, [MeasureType.SHADED_SPECTRUM, MeasureType.SPECTRUM]))
            return noDataColour
              ? true
              : !(min === null || min === undefined || max === null || max === undefined);
          return values.filter(value => !value?.hideFromLegend).length > 0;
        },
      );
      return { ...results, [mapOverlayCode]: { serieses } };
    }, {}) as {
      [mapOverlayCode: string]: {
        serieses: Series[];
      };
    };

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
          const hasIconLayer = baseSerieses.some(l => l.type === MeasureType.ICON);
          const hasRadiusLayer = baseSerieses.some(l => l.type === MeasureType.RADIUS);
          const hasColorLayer = baseSerieses.some(l =>
            checkMeasureType(l.type as MeasureTypeLiteral, coloredMeasureTypes),
          );
          const isDisplayed =
            !displayedMapOverlayCodes || displayedMapOverlayCodes.includes(mapOverlayCode);

          return serieses
            .sort(a => (a.type === MeasureType.COLOR ? -1 : 1)) // color series should sit at the top
            .map((series, index) => {
              const { type } = series;
              const LegendComponent = getLegendComponent(type as MeasureTypeLiteral);
              return (
                <React.Fragment key={series.key}>
                  <SeriesContainer className={className} isDisplayed={isDisplayed}>
                    {legendsHaveSameType && <LegendName>{`${series.name}: `}</LegendName>}
                    <LegendComponent
                      hasIconLayer={hasIconLayer}
                      hasRadiusLayer={hasRadiusLayer}
                      hasColorLayer={hasColorLayer}
                      series={series}
                      setValueHidden={setValueHidden}
                      hiddenValues={hiddenValues}
                    />
                  </SeriesContainer>
                  {index < serieses.length - 1 && SeriesDivider && <SeriesDivider />}
                </React.Fragment>
              );
            });
        })}
      </>
    );
  },
);
