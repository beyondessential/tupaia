import React from 'react';
import styled, { css } from 'styled-components';
import { MeasureType } from '@tupaia/types';
import { LegendProps as BaseLegendProps, Series, SpectrumSeries } from '../../types';
import { MarkerLegend } from './MarkerLegend';
import { SpectrumLegend } from './SpectrumLegend';

type MeasureTypeLiteral = `${MeasureType}` | 'popup-only';

const LegendFrame = styled.div<{
  isDisplayed: boolean;
  $isExport?: boolean;
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
  margin-block: 0.6rem;
  margin-inline: auto;

  ${({ $isExport, theme }) =>
    $isExport
      ? css`
          margin: 0;
        `
      : css`
          ${theme.breakpoints.down('sm')} {
            margin-inline: 0 0.6rem;
          }
        `}
`;

const LegendName = styled.div`
  margin-block: auto;
  margin-inline: 0.6rem;
`;

// This is a workaround for type errors we get when trying to use Array.includes with a subset of a union type. This solution comes from https://github.com/microsoft/TypeScript/issues/51881
const checkMeasureType = (item: MeasureTypeLiteral, subset: MeasureTypeLiteral[]) =>
  (subset as ReadonlyArray<MeasureTypeLiteral>).includes(item);

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
  SeriesDivider?: React.ComponentType<any> | null;
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
    isExport,
  }: LegendProps) => {
    if (Object.keys(baseMeasureInfo).length === 0) {
      return null;
    }

    const measureInfo = currentMapOverlayCodes.reduce((results, mapOverlayCode) => {
      // measure info for mapOverlayCode may not exist when location changes.
      const baseSerieses = baseMeasureInfo[mapOverlayCode]?.[seriesesKey] || [];
      const serieses = baseSerieses.filter((series: Series) => {
        const { type, hideFromLegend, values = [] } = series;

        // if type is radius or popup-only, don't create a legend
        if (checkMeasureType(type, [MeasureType.RADIUS, 'popup-only'])) return false;

        // if hideFromLegend is true, don't create a legend
        if (hideFromLegend) return false;

        // if type is spectrum or shaded-spectrum, only create a legend if min and max are set OR noDataColour is set. If noDataColour is not set, that means hideNullFromLegend has been set as true in the map overlay config. Spectrum legends 'values' property will always be []
        if (checkMeasureType(type, [MeasureType.SPECTRUM, MeasureType.SHADED_SPECTRUM])) {
          const { min, max, noDataColour } = series as SpectrumSeries;
          return noDataColour
            ? true
            : !(min === null || min === undefined || max === null || max === undefined);
        }
        return values.filter(value => !value?.hideFromLegend).length > 0;
      });
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
            checkMeasureType(l.type, [
              MeasureType.COLOR,
              MeasureType.SPECTRUM,
              MeasureType.SHADED_SPECTRUM,
            ]),
          );
          const isDisplayed =
            !displayedMapOverlayCodes || displayedMapOverlayCodes.includes(mapOverlayCode);

          return serieses
            .sort(a => (a.type === MeasureType.COLOR ? -1 : 1)) // color series should sit at the top
            .map((series, index) => {
              return (
                <SeriesContainer
                  className={className}
                  isDisplayed={isDisplayed}
                  key={series.key}
                  $isExport={isExport}
                >
                  {legendsHaveSameType && <LegendName>{`${series.name}: `}</LegendName>}
                  <LegendComponent
                    series={series}
                    hasIconLayer={hasIconLayer}
                    hasColorLayer={hasColorLayer}
                    hasRadiusLayer={hasRadiusLayer}
                    setValueHidden={setValueHidden}
                    hiddenValues={hiddenValues}
                    isExport={isExport}
                  />
                  {index < serieses.length - 1 && SeriesDivider && <SeriesDivider />}
                </SeriesContainer>
              );
            });
        })}
      </>
    );
  },
);

type LegendComponentProps = {
  series: Series;
  hasIconLayer: boolean;
  hasColorLayer: boolean;
  hasRadiusLayer: boolean;
  hiddenValues: LegendProps['hiddenValues'];
  setValueHidden: LegendProps['setValueHidden'];
  isExport?: LegendProps['isExport'];
};

/**
 * utility component for rendering the correct legend based on the series type, so that the correct props get passed to the correct legend component, and typescript doesn't complain
 */
const LegendComponent = ({
  series,
  hasIconLayer,
  hasColorLayer,
  hasRadiusLayer,
  hiddenValues,
  setValueHidden,
  isExport,
}: LegendComponentProps) => {
  const { type } = series;
  switch (type) {
    case MeasureType.SHADED_SPECTRUM:
    case MeasureType.SPECTRUM:
      return (
        <SpectrumLegend
          series={series}
          setValueHidden={setValueHidden}
          hiddenValues={hiddenValues}
        />
      );
    case MeasureType.RADIUS:
      return null;
    default:
      return (
        <MarkerLegend
          hasIconLayer={hasIconLayer}
          hasRadiusLayer={hasRadiusLayer}
          hasColorLayer={hasColorLayer}
          series={series}
          setValueHidden={setValueHidden}
          hiddenValues={hiddenValues}
          isExport={isExport}
        />
      );
  }
};
