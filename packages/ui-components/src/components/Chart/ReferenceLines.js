/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { ReferenceLine } from 'recharts';
import { TUPAIA_ORANGE, CHART_TYPES } from './constants';
import { formatDataValueByType } from '@tupaia/utils';
import { ReferenceLabel } from './ReferenceLabel';

const ReferenceLineLabel = ({ referenceLineLabel, isExporting }) => {
  if (referenceLineLabel === undefined) return null;
  return (
    <ReferenceLabel value={`${referenceLineLabel}`} fill={isExporting ? '#000000' : '#ffffff'} />
  );
};

ReferenceLineLabel.propTypes = {
  referenceLineLabel: PropTypes.string.isRequired,
  isExporting: PropTypes.bool,
};

ReferenceLineLabel.defaultProps = {
  isExporting: false,
};

// Todo: move orientationToYAxis to constants or utils
// Orientation of the axis is used as an alias for its id
const Y_AXIS_IDS = {
  left: 0,
  right: 1,
};

const DEFAULT_Y_AXIS = {
  id: Y_AXIS_IDS.left,
  orientation: 'left',
  yAxisDomain: {
    min: { type: 'number', value: 0 },
    max: { type: 'string', value: 'auto' },
  },
};

const orientationToYAxisId = orientation => Y_AXIS_IDS[orientation] || DEFAULT_Y_AXIS.id;

const ValueReferenceLine = ({ viewContent, isExporting }) => {
  const { chartConfig = {} } = viewContent;

  const referenceLines = Object.entries(chartConfig)
    .filter(([, { referenceValue }]) => referenceValue)
    .map(([dataKey, { referenceValue, yAxisOrientation, referenceLabel }]) => ({
      key: `reference_line_${dataKey}`, // Use prefix to distinguish from curve key
      y: referenceValue,
      yAxisId: orientationToYAxisId(yAxisOrientation),
      referenceLineLabel: referenceLabel,
    }));

  return referenceLines.map(referenceLine => (
    <ReferenceLine
      stroke={isExporting ? '#000000' : '#ffffff'}
      strokeDasharray="3 3"
      label={ReferenceLineLabel({
        referenceLineLabel: referenceLine.referenceLineLabel,
        isExporting,
      })}
      {...referenceLine}
    />
  ));
};

ValueReferenceLine.propTypes = {
  viewContent: PropTypes.object.isRequired,
  isExporting: PropTypes.bool,
};

ValueReferenceLine.defaultProps = {
  isExporting: false,
};

const AverageReferenceLine = ({ viewContent, isExporting, isEnlarged }) => {
  const { valueType, data, presentationOptions } = viewContent;
  // show reference line by default
  const shouldHideReferenceLine = presentationOptions && presentationOptions.hideAverage;
  // average is null for stacked charts that don't have a "value" key in data
  const average = data.reduce((acc, row) => acc + row.value, 0) / data.length;

  if (!average || shouldHideReferenceLine) {
    return null;
  }
  return (
    <ReferenceLine
      y={average}
      stroke={TUPAIA_ORANGE}
      label={
        <ReferenceLabel
          value={`Average ${formatDataValueByType({ value: average }, valueType)}`}
          fill={TUPAIA_ORANGE}
        />
      }
      isAnimationActive={isEnlarged && !isExporting}
    />
  );
};

AverageReferenceLine.propTypes = {
  viewContent: PropTypes.object.isRequired,
  isExporting: PropTypes.bool,
  isEnlarged: PropTypes.bool,
};

AverageReferenceLine.defaultProps = {
  isExporting: false,
  isEnlarged: false,
};

export const ReferenceLines = ({ viewContent, isExporting, isEnlarged }) => {
  if (viewContent.chartType === CHART_TYPES.BAR) {
    return AverageReferenceLine({ viewContent, isExporting, isEnlarged });
  }
  return ValueReferenceLine({ viewContent, isExporting, isEnlarged });
};

ReferenceLines.propTypes = {
  viewContent: PropTypes.object.isRequired,
  isExporting: PropTypes.bool,
  isEnlarged: PropTypes.bool,
};

ReferenceLines.defaultProps = {
  isExporting: false,
  isEnlarged: false,
};
