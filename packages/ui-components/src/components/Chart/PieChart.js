/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import { Pie, PieChart as PieChartComponent, Tooltip } from 'recharts';

export const PieChart = ({ data, config }) => {
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
          fill="#8884d8"
          label
        />
        <Tooltip />
      </PieChartComponent>
    </section>
  );
};

PieChart.propTypes = {
  data: PropTypes.object.isRequired,
  config: PropTypes.object.isRequired,
};
