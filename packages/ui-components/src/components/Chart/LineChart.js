/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Line, LabelList } from 'recharts';
import { formatDataValueByType } from '@tupaia/utils';
import { BLUE, DARK_BLUE } from './constants';

export const LineChart = ({
  color,
  dataKey,
  yAxisId,
  valueType,
  isEnlarged,
  isExporting,
  opacity,
  connectNulls,
  exportWithLabels,
}) => {
  const defaultColor = isExporting ? DARK_BLUE : BLUE;

  return (
    <Line
      key={dataKey}
      type="monotone"
      dataKey={dataKey}
      yAxisId={yAxisId}
      stroke={color || defaultColor}
      strokeWidth={isEnlarged ? 3 : 1}
      strokeOpacity={opacity}
      fill={color || defaultColor}
      connectNulls={connectNulls}
      isAnimationActive={isEnlarged && !isExporting}
    >
      {isExporting && exportWithLabels && (
        <LabelList
          dataKey={dataKey}
          position="insideTopRight"
          offset={-20}
          angle="50"
          formatter={value => formatDataValueByType({ value }, valueType)}
        />
      )}
    </Line>
  );
};

LineChart.propTypes = {
  dataKey: PropTypes.string.isRequired,
  opacity: PropTypes.string,
  yAxisId: PropTypes.string.isRequired,
  valueType: PropTypes.string.isRequired,
  color: PropTypes.string,
  isExporting: PropTypes.bool,
  isEnlarged: PropTypes.bool,
  connectNulls: PropTypes.bool,
  exportWithLabels: PropTypes.bool,
};

LineChart.defaultProps = {
  color: BLUE,
  isExporting: false,
  isEnlarged: false,
  opacity: null,
  connectNulls: false,
  exportWithLabels: true,
};
