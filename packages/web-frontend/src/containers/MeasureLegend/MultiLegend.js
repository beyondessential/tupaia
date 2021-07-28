/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { MeasureOptionsGroupPropType } from '../../components/Marker/propTypes';
import { BOX_SHADOW, OFF_WHITE, TRANS_BLACK_LESS } from '../../styles';
import {
  MEASURE_TYPE_COLOR,
  MEASURE_TYPE_ICON,
  MEASURE_TYPE_RADIUS,
  MEASURE_TYPE_SHADED_SPECTRUM,
  MEASURE_TYPE_SPECTRUM,
  MEASURE_TYPE_POPUP_ONLY,
} from '../../utils/measures';
import { MarkerLegend } from './MarkerLegend';
import { SpectrumLegend } from './SpectrumLegend';

const LegendOuterFrame = styled.div`
  width: 100%;
  display: flex;
`;

const LegendFrame = styled.div`
  padding: 5px;
  margin: 10px auto;
  border-radius: 3px;
  cursor: auto;
  color: ${OFF_WHITE};
  background-color: ${TRANS_BLACK_LESS};
  box-shadow: ${BOX_SHADOW};
`;

const coloredMeasureTypes = [
  MEASURE_TYPE_COLOR,
  MEASURE_TYPE_SPECTRUM,
  MEASURE_TYPE_SHADED_SPECTRUM,
];

const NullLegend = () => null;

const getLegend = measureType => {
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

const MultiLegend = React.memo(({ measureOptions, isMeasureLoading }) => {
  const displayedLegends = measureOptions.filter(
    ({ type, hideFromLegend }) =>
      ![MEASURE_TYPE_RADIUS, MEASURE_TYPE_POPUP_ONLY].includes(type) && hideFromLegend !== true,
  );

  // returning <LegendOuterFrame /> keeps the map control on the right hand side
  if (isMeasureLoading || displayedLegends.length === 0) {
    return <LegendOuterFrame />;
  }

  const hasIconLayer = measureOptions.some(l => l.type === MEASURE_TYPE_ICON);
  const hasRadiusLayer = measureOptions.some(l => l.type === MEASURE_TYPE_RADIUS);
  const hasColorLayer = measureOptions.some(l => coloredMeasureTypes.includes(l.type));

  const legends = displayedLegends.map(mo => {
    const { type } = mo;
    const Legend = getLegend(type);

    return (
      <Legend
        key={mo.key}
        hasIconLayer={hasIconLayer}
        hasRadiusLayer={hasRadiusLayer}
        hasColorLayer={hasColorLayer}
        measureOptions={mo}
      />
    );
  });

  return (
    <LegendOuterFrame>
      <LegendFrame>{legends}</LegendFrame>
    </LegendOuterFrame>
  );
});

MultiLegend.propTypes = {
  measureOptions: MeasureOptionsGroupPropType.isRequired,
  isMeasureLoading: PropTypes.bool.isRequired,
};

const mapStateToProps = state => {
  const { isMeasureLoading, measureInfo } = state.map;
  const { measureOptions = [] } = measureInfo;

  return {
    measureOptions,
    isMeasureLoading,
  };
};

export default connect(mapStateToProps)(MultiLegend);
