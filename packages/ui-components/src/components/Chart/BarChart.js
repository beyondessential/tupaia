/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Bar, LabelList } from 'recharts';
import { formatDataValueByType } from '@tupaia/utils';
import { BLUE, CHART_TYPES, PRESENTATION_OPTIONS_SHAPE } from './constants';

export const BarChart = ({
  color = BLUE,
  dataKey,
  yAxisId,
  stackId,
  valueType,
  data,
  isEnlarged,
  isExporting,
  chartConfig,
  presentationOptions = {},
}) => {
  const { hideExportValues } = presentationOptions;
  const getBarSize = () => {
    if (chartConfig.chartType === CHART_TYPES.COMPOSED || data.length === 1) {
      return isEnlarged ? 100 : 50;
    }
    return undefined;
  };

  return (
    <Bar
      key={dataKey}
      dataKey={dataKey}
      yAxisId={yAxisId}
      stackId={stackId}
      fill={color}
      isAnimationActive={isEnlarged && !isExporting}
      barSize={getBarSize()}
    >
      {isExporting && !hideExportValues && (
        <LabelList
          dataKey={dataKey}
          position="insideTop"
          offset={chartConfig ? -15 : -12}
          formatter={value => formatDataValueByType({ value }, valueType)}
        />
      )}
    </Bar>
  );
};

BarChart.propTypes = {
  dataKey: PropTypes.string.isRequired,
  yAxisId: PropTypes.string.isRequired,
  stackId: PropTypes.string.isRequired,
  valueType: PropTypes.string.isRequired,
  color: PropTypes.string,
  chartConfig: PropTypes.object.isRequired,
  isExporting: PropTypes.bool,
  isEnlarged: PropTypes.bool,
  data: PropTypes.array.isRequired,
  presentationOptions: PropTypes.shape(PRESENTATION_OPTIONS_SHAPE),
};

BarChart.defaultProps = {
  color: BLUE,
  presentationOptions: {},
  isExporting: false,
  isEnlarged: false,
};
