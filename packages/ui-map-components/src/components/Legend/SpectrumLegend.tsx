import moment from 'moment';
import React from 'react';
import MuiBox from '@material-ui/core/Box';
import styled from 'styled-components';
import { formatDataValueByType } from '@tupaia/utils';
import { ScaleType } from '@tupaia/types';
import { resolveSpectrumColour } from '../../utils';
import { SpectrumLegendProps, SpectrumSeries, Value } from '../../types';
import { LEGEND_SHADING_ICON, getMarkerForOption } from '../Markers/markerIcons';
import { LegendEntry } from './LegendEntry';

const FlexCenter = styled(MuiBox)`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SpectrumContainer = styled.div<{
  $hasNoData: boolean;
}>`
  max-width: ${p => (p.$hasNoData ? '70%' : '100%')};
`;

const SpectrumDivsContainer = styled.div`
  border-radius: 4px;
  overflow: hidden;
  display: flex;
`;

const SpectrumSliver = styled.div`
  width: 2px;
  height: 15px;
`;

const LabelLeft = styled.div`
  margin-right: 0.625rem;
`;

const LabelRight = styled.div`
  margin-left: 0.625rem;
`;

const getSpectrumLabels = (
  scaleType: `${ScaleType}`,
  min: number,
  max: number,
  valueType?: SpectrumSeries['valueType'],
): {
  left: string;
  right: string;
} => {
  switch (scaleType) {
    case ScaleType.GPI:
    case ScaleType.PERFORMANCE:
    case ScaleType.PERFORMANCE_DESC:
    case ScaleType.NEUTRAL:
      return {
        left: formatDataValueByType({ value: min }, valueType),
        right: formatDataValueByType({ value: max }, valueType),
      };
    default:
      return { left: '0%', right: '100%' };
  }
};

const renderSpectrum = ({ min, max, scaleType, scaleColorScheme, valueType }: SpectrumSeries) => {
  if (min == null || max == null) return null;

  const spectrumDivs = [];

  if (min === max) {
    // There will only be a single value displayed, let's just default it to the middle color (50 % of the way from 0 to 1):

    const colour = resolveSpectrumColour(scaleType, scaleColorScheme, 0.5, 0, 1);
    const { left: label } = getSpectrumLabels(scaleType, min, min, valueType);

    return (
      <LegendEntry
        marker={getMarkerForOption(LEGEND_SHADING_ICON, colour)}
        label={label}
        value={min}
        unClickable
      />
    );
  }

  switch (scaleType) {
    case ScaleType.PERFORMANCE:
    case ScaleType.GPI:
    case ScaleType.PERFORMANCE_DESC:
    case ScaleType.NEUTRAL:
    default: {
      const increment = (max - min) / 100;

      for (let i = min; i < max; i += increment) {
        const colour = resolveSpectrumColour(scaleType, scaleColorScheme, i, min, max);
        spectrumDivs.push(<SpectrumSliver style={{ background: colour }} key={i} />);
      }
    }
  }

  const labels = getSpectrumLabels(scaleType, min, max, valueType);
  return (
    <FlexCenter>
      <LabelLeft>{labels.left}</LabelLeft>
      <SpectrumDivsContainer>{spectrumDivs}</SpectrumDivsContainer>
      <LabelRight>{labels.right}</LabelRight>
    </FlexCenter>
  );
};

export const SpectrumLegend = React.memo(
  ({ series, setValueHidden, hiddenValues = {} }: SpectrumLegendProps) => {
    const {
      valueMapping,
      noDataColour,
      min,
      max,
      scaleType,
      scaleColorScheme,
      valueType,
      key: dataKey,
    } = series;

    const { value } = valueMapping.null;

    return (
      <FlexCenter flexWrap="wrap">
        <SpectrumContainer $hasNoData={!!noDataColour}>
          {renderSpectrum({
            min,
            max,
            scaleType,
            scaleColorScheme,
            valueType,
          } as SpectrumSeries)}
        </SpectrumContainer>
        {noDataColour && (
          <LegendEntry
            marker={getMarkerForOption(LEGEND_SHADING_ICON, noDataColour, 'none')}
            label="No data"
            dataKey={dataKey}
            hiddenValues={hiddenValues}
            onClick={setValueHidden}
            value={value as Value}
          />
        )}
      </FlexCenter>
    );
  },
);
