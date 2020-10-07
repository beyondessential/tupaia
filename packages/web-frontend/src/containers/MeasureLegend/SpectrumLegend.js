import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styled from 'styled-components';
import moment from 'moment';
import NoDataLabel, { LabelLeft, LabelRight } from './labels';

import { formatDataValue } from '../../utils/formatters';
import { LegendContainer } from './utils';
import { MeasureOptionsPropType } from '../../components/Marker/propTypes';
import { resolveSpectrumColour } from '../../components/Marker';
import { SCALE_TYPES } from '../../constants';

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

const getSpectrumDivs = ({ min, max, scaleType, scaleColorScheme, valueType }) => {
  const spectrumDivs = [];

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

  return spectrumDivs;
};

export const SpectrumLegend = ({ measureOptions }) => {
  const { scaleType, min, max, valueType, valueMapping, noDataColour } = measureOptions;
  const spectrumDivs = getSpectrumDivs(measureOptions);
  const labels = getSpectrumLabels(scaleType, min, max, valueType);

  return (
    <LegendContainer>
      <LabelLeft>{labels.left}</LabelLeft>
      {spectrumDivs}
      <LabelRight>{labels.right}</LabelRight>
      {noDataColour && <NoDataLabel noDataColour={noDataColour} valueMapping={valueMapping} />}
    </LegendContainer>
  );
};

SpectrumLegend.propTypes = {
  measureOptions: MeasureOptionsPropType.isRequired,
};
