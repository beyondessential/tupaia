/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import moment from 'moment';
import React from 'react';
import styled from 'styled-components';
import { getMarkerForOption, resolveSpectrumColour } from '../../components/Marker';
import { LEGEND_SHADING_ICON } from '../../components/Marker/markerIcons';
import { MeasureOptionsPropType } from '../../components/Marker/propTypes';
import { SCALE_TYPES } from '../../constants';
import { formatDataValue } from '../../utils/formatters';
import NoDataLabel, { LabelLeft, LabelRight } from './labels';
import { LegendContainer } from './common';
import LegendEntry from './LegendEntry';

const SpectrumSliver = styled.div`
  width: 2px;
  height: 15px;
`;

const getSpectrumLabels = (scaleType, min, max, valueType) => {
  switch (scaleType) {
    case SCALE_TYPES.PERFORMANCE:
    case SCALE_TYPES.PERFORMANCE_DESC:
    case SCALE_TYPES.NEUTRAL:
      return { left: formatDataValue(min, valueType), right: formatDataValue(max, valueType) };
    case SCALE_TYPES.TIME:
      return { left: '0 days', right: `${moment(max).diff(min, 'days')} days old` };
    default:
      return { left: '0%', right: '100%' };
  }
};

const renderSpectrum = measureOptions => {
  const { min, max, scaleType, scaleColorScheme, valueType } = measureOptions;

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
        dataKey={null}
        unClickable
      />
    );
  }

  switch (scaleType) {
    case SCALE_TYPES.TIME:
      for (let i = 0; i < 1; i += 0.01) {
        const colour = resolveSpectrumColour(scaleType, scaleColorScheme, i, min, max);
        spectrumDivs.push(<SpectrumSliver style={{ background: colour }} key={i} />);
      }
      break;
    case SCALE_TYPES.PERFORMANCE:
    case SCALE_TYPES.PERFORMANCE_DESC:
    case SCALE_TYPES.NEUTRAL:
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
    <LegendContainer>
      <LabelLeft>{labels.left}</LabelLeft>
      {spectrumDivs}
      <LabelRight>{labels.right}</LabelRight>
    </LegendContainer>
  );
};

export const SpectrumLegend = ({ measureOptions }) => {
  const { valueMapping, noDataColour } = measureOptions;

  return (
    <LegendContainer>
      {renderSpectrum(measureOptions)}
      {noDataColour && <NoDataLabel noDataColour={noDataColour} valueMapping={valueMapping} />}
    </LegendContainer>
  );
};

SpectrumLegend.propTypes = {
  measureOptions: MeasureOptionsPropType.isRequired,
};
