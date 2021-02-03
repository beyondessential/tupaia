/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';

export const Legend = ({ chartConfig, onClick, getIsActiveKey, isExporting }) => {
  const formatLegend = (value, { color }) => {
    const isActive = getIsActiveKey(value);
    const displayColor = isActive ? color : color;
    // const displayColor = isActive ? color : getInactiveColor(color);
    return (
      <span style={{ color: displayColor, textDecoration: isActive ? '' : 'line-through' }}>
        {chartConfig[value].label || value}
      </span>
    );
  };

  return (
    <Legend
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
