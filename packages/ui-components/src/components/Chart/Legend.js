/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { Legend as LegendComponent } from 'recharts';
import PropTypes from 'prop-types';

export const Legend = ({ chartConfig, onClick, getIsActiveKey, isExporting }) => {
  const formatLegend = (value, { color }) => {
    const isActive = getIsActiveKey(value);
    return (
      <span style={{ color, textDecoration: isActive ? '' : 'line-through' }}>
        {chartConfig[value].label || value}
      </span>
    );
  };

  return (
    <LegendComponent
      onClick={onClick}
      formatter={formatLegend}
      verticalAlign={isExporting ? 'top' : 'bottom'}
      wrapperStyle={isExporting ? { top: '-20px' } : {}}
    />
  );
};

Legend.propTypes = {
  chartConfig: PropTypes.object.isRequired,
  onClick: PropTypes.func.isRequired,
  getIsActiveKey: PropTypes.func.isRequired,
  isExporting: PropTypes.bool,
};

Legend.defaultProps = {
  isExporting: false,
};
