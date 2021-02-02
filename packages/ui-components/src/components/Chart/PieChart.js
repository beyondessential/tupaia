/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import { Pie, PieChart as PieChartComponent, Tooltip, Legend, Cell } from 'recharts';
import { CHART_COLOR_PALETTE } from '@tupaia/web-frontend/src/styles';

export const PieChart = ({ data, config }) => {
  const palette = CHART_COLOR_PALETTE;
  const chartColors = Object.values(palette);

  const chartColorAtIndex = (colorArray, index) => {
    return colorArray[index % colorArray.length];
  };

  return (
    <section>
      <Box ml={2}>
        <Typography variant="h3">{config.name}</Typography>
      </Box>
      <PieChartComponent width={500} height={500}>
        <Pie
          dataKey="value"
          isAnimationActive={false}
          data={data}
          cx={200}
          cy={200}
          outerRadius={120}
          // fill="#8884d8"
          label
        >
          {data.map((entry, index) => {
            const fill = chartColorAtIndex(chartColors, index);
            return <Cell key={`cell-${index}`} fill={fill} stroke="#FFFFFF" />;
          })}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChartComponent>
    </section>
  );
};

PieChart.propTypes = {
  data: PropTypes.object.isRequired,
  config: PropTypes.object.isRequired,
};
