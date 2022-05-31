import React from 'react';
import { Svg, Line, Text } from '@react-pdf/renderer';

const DashboardNameSubHeader = () => {
  const dashboardName = 'Schools';
  return (
    <Svg width="497" height="3" viewBox="0 0 497 3">
      <Text x="0" y="15">
        {dashboardName}
      </Text>
      <Line x1="0" y1="20" x2="497" y2="20" stroke="#D13333" strokeWidth="3" />
    </Svg>
  );
};

export default DashboardNameSubHeader;
