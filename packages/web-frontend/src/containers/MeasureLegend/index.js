/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

/**
 * MeasureLegend
 *
 * Displays the measure near the bottom center of screen when appropriate
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styled from 'styled-components';
import moment from 'moment';

import { getMarkerForOption, resolveSpectrumColour, UNKNOWN_COLOR } from '../../components/Marker';
import { BOX_SHADOW, TRANS_BLACK_LESS, OFF_WHITE, WHITE } from '../../styles';
import NoDataLabel, { LabelLeft, LabelRight } from './labels';
import { SCALE_TYPES } from '../../constants';
import {
  MEASURE_TYPE_ICON,
  MEASURE_TYPE_RADIUS,
  MEASURE_TYPE_SPECTRUM,
  MEASURE_TYPE_SHADING,
  MEASURE_TYPE_COLOR,
  MEASURE_VALUE_OTHER,
  MEASURE_VALUE_NULL,
  MEASURE_TYPE_SHADED_SPECTRUM,
} from '../../utils/measures';
import { formatDataValue } from '../../utils/formatters';
import {
  DEFAULT_ICON,
  LEGEND_COLOR_ICON,
  LEGEND_SHADING_ICON,
  LEGEND_RADIUS_ICON,
  HIDDEN_ICON,
} from '../../components/Marker/markerIcons';
import {
  MeasureOptionsPropType,
  MeasureOptionsGroupPropType,
} from '../../components/Marker/propTypes';

const coloredMeasureTypes = [
  MEASURE_TYPE_COLOR,
  MEASURE_TYPE_SPECTRUM,
  MEASURE_TYPE_SHADED_SPECTRUM,
];

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

const LegendContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
`;

const Key = styled.div`
  padding: 5px;
  display: flex;
  flex-direction: row;
  align-items: center;
  pointer-events: auto;
  cursor: pointer;
  ${p => (p.hidden ? 'opacity: 0.5;' : '')}
`;

const SpectrumSliver = styled.div`
  width: 2px;
  height: 15px;
`;

const getLabels = (scaleType, min, max, valueType) => {
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

const SpectrumLegend = ({
  scaleType,
  scaleColorScheme,
  min,
  max,
  noDataColour,
  valueMapping,
  valueType,
}) => {
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
  const labels = getLabels(scaleType, min, max, valueType);
  return (
    <LegendContainer>
      <LabelLeft>{labels.left}</LabelLeft>
      {spectrumDivs}
      <LabelRight>{labels.right}</LabelRight>
      {noDataColour && <NoDataLabel noDataColour={noDataColour} valueMapping={valueMapping} />}
    </LegendContainer>
  );
};

const mapLegendStatetoProps = () => {
  return state => ({
    hiddenMeasures: state.map.measureInfo.hiddenMeasures,
  });
};

const mapLegendDispatchToProps = () => {
  return dispatch => ({
    onClick: (key, value, hide) =>
      dispatch({
        key,
        value,
        type: hide ? 'HIDE_MAP_MEASURE' : 'UNHIDE_MAP_MEASURE',
      }),
  });
};

const LegendEntry = connect(
  mapLegendStatetoProps,
  mapLegendDispatchToProps,
)(({ marker, label, value, dataKey, onClick, hiddenMeasures }) => {
  const hidden = (hiddenMeasures[dataKey] || {})[value];

  return (
    <Key onClick={() => onClick(dataKey, value, !hidden)} hidden={hidden}>
      {marker}
      <div>{label}</div>
    </Key>
  );
});

// Icon layers can be set to hide some values from the map entirely - but if we're showing
// radius values for them, we should still put them in the legend!
// If a specific value has been set, assume that it's intentional that it's been hidden,
// and hide the radius as well. But, if the hidden icon is 'other', go ahead and add it to
// the legend and show the radius.
function isHiddenOtherIcon({ value, icon }) {
  return value === MEASURE_VALUE_OTHER && icon === HIDDEN_ICON;
}

function getLegendColor(value, type, hasColorLayer) {
  if (coloredMeasureTypes.includes(type)) {
    // if this layer is providing color, of course show the color
    return value.color;
  }
  if (hasColorLayer) {
    // if a different layer is providing color, always show legend icons in white
    return WHITE;
  }

  // if we have a color that isn't being overridden elsewhere, show it
  return value.color || UNKNOWN_COLOR;
}

function getLegendMarkerForValue(value, type, hasIconLayer, hasRadiusLayer, hasColorLayer) {
  const { icon } = value;

  const color = getLegendColor(value, type, hasColorLayer);

  if (type === MEASURE_TYPE_ICON) {
    if (hasRadiusLayer && isHiddenOtherIcon(value)) {
      // this is a radius/icon combo measure -- show a ring for the 'no icon' option
      return getMarkerForOption(LEGEND_RADIUS_ICON, color);
    }
    if (hasColorLayer) {
      // color info is from another layer, so show the icons all in white
      return getMarkerForOption(icon, color);
    }
    // straight up icons! just show them
    return getMarkerForOption(icon, color);
  }
  if (type === MEASURE_TYPE_SHADING) {
    // show squares; icons will be displayed in another legend
    return getMarkerForOption(LEGEND_SHADING_ICON, color);
  }
  if (hasIconLayer) {
    // show circles; icons will be displayed in another legend
    return getMarkerForOption(LEGEND_COLOR_ICON, color);
  }
  if (hasRadiusLayer) {
    // show rings, as we are indicating radius colors
    return getMarkerForOption(LEGEND_RADIUS_ICON, color);
  }
  // color is the only measure here - show pins
  return getMarkerForOption(DEFAULT_ICON, color);
}

const MeasureLegend = ({ measureOptions, hasIconLayer, hasRadiusLayer, hasColorLayer }) => {
  const {
    values,
    type,
    valueMapping,
    scaleType,
    scaleColorScheme,
    noDataColour,
    key: dataKey,
    min,
    max,
    valueType,
  } = measureOptions;

  if (type === MEASURE_TYPE_SPECTRUM || type === MEASURE_TYPE_SHADED_SPECTRUM) {
    return (
      <SpectrumLegend
        scaleType={scaleType}
        scaleColorScheme={scaleColorScheme}
        min={min}
        max={max}
        noDataColour={noDataColour}
        valueType={valueType}
        valueMapping={valueMapping}
      />
    );
  }

  if (type === MEASURE_TYPE_RADIUS) {
    return null;
  }

  const keys = values
    .filter(v => !v.hideFromLegend)
    .filter(v => hasRadiusLayer || !isHiddenOtherIcon(v)) // only show hidden icons in legend if paired with radius
    .filter(v => v.value !== MEASURE_VALUE_NULL && v.value !== null) // we will be rendering this below
    .map(v => {
      const marker = getLegendMarkerForValue(v, type, hasIconLayer, hasRadiusLayer, hasColorLayer);
      return (
        <LegendEntry
          key={v.name}
          dataKey={dataKey}
          marker={marker}
          label={v.name}
          value={v.value}
        />
      );
    });

  // Sometimes we want to group Null + No = No.
  // So we dont wan't to render 'No data' legend if that's the case
  const hasGroupedLegendIncludingNull = values.some(({ value }) => {
    if (Array.isArray(value)) {
      return value.some(innerValue => innerValue === MEASURE_VALUE_NULL);
    }

    return false;
  });

  let nullKey = null;
  const nullItem = valueMapping.null;

  if (!hasGroupedLegendIncludingNull && nullItem && !nullItem.hideFromLegend) {
    nullKey = (
      <LegendEntry
        marker={getLegendMarkerForValue(
          nullItem,
          type,
          hasIconLayer,
          hasRadiusLayer,
          hasColorLayer,
        )}
        label={nullItem.name}
        dataKey={dataKey}
        value={null}
      />
    );
  }

  return (
    <LegendContainer>
      {keys}
      {nullKey}
    </LegendContainer>
  );
};

MeasureLegend.propTypes = {
  measureOptions: MeasureOptionsPropType.isRequired,
  hasIconLayer: PropTypes.bool.isRequired,
};

const MultiLegend = ({ measureOptions, isMeasureLoading }) => {
  if (isMeasureLoading) {
    return null;
  }

  const hasIconLayer = measureOptions.some(l => l.type === MEASURE_TYPE_ICON);
  const hasRadiusLayer = measureOptions.some(l => l.type === MEASURE_TYPE_RADIUS);
  const hasColorLayer = measureOptions.some(l => coloredMeasureTypes.includes(l.type));

  const displayedLegends = measureOptions.filter(({ type }) => type !== MEASURE_TYPE_RADIUS);

  const legends = displayedLegends.map(mo => (
    <MeasureLegend
      key={mo.key}
      hasIconLayer={hasIconLayer}
      hasRadiusLayer={hasRadiusLayer}
      hasColorLayer={hasColorLayer}
      measureOptions={mo}
    />
  ));

  return (
    <LegendOuterFrame>
      <LegendFrame>{legends}</LegendFrame>
    </LegendOuterFrame>
  );
};

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
