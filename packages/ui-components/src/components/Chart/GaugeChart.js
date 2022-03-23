/*
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

/**
 * GaugeChart
 *
 * Renders a recharts GaugeChart from data provided by viewContent object
 * @prop {object} viewContent An object with the following structure
   {
    "type":"chart",
    "chartType":"gauge",
    "name":"% Stock on Hand",
    "valueType": "percentage",
    "color": "#111111",
    "data":[{ value:0.485 }]
  }
 */

import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { formatDataValueByType } from '@tupaia/utils';
import {
  PieChart as BasePieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Label,
  Text as RechartText,
} from 'recharts';
import { VIEW_CONTENT_SHAPE, BLUE, TRANS_BLACK, WHITE } from './constants';
import { isMobile } from './utils';

const Text = styled(RechartText)`
  font-size: ${p => p.$fontSize};
  font-weight: bold;
  fill: ${({ theme, $isExporting }) => {
    return theme.palette.type === 'light' || $isExporting ? TRANS_BLACK : WHITE;
  }};
`;

const getHeight = (isExporting, isEnlarged) => {
  if (isExporting) {
    return 420;
  }
  return isEnlarged && isMobile() ? 320 : undefined;
};

export const GaugeChart = props => {
  const { viewContent, isExporting, isEnlarged, onItemClick } = props;
  const { data, color = BLUE, ...restOfConfigs } = viewContent;

  const generateElements = () => {
    const denominator = 0.05;
    const elements = [...data];
    const cellComponents = [<Cell fill={color} />];
    const numOfElements = Math.floor((1 - data[0].value) / denominator);

    for (let i = 0; i < numOfElements; i++) {
      elements.push({ value: denominator });
      cellComponents.push(<Cell key={`cell-${i}`} fill="#eaeaea" />);
    }

    return { elements, cellComponents };
  };

  const { elements, cellComponents } = useMemo(() => generateElements(), [data]);
  const height = useMemo(() => getHeight(isExporting, isEnlarged), [isExporting, isEnlarged]);

  const responsiveStyle = !isEnlarged && !isMobile() && !isExporting ? 1 : 1.5;
  const innerRadius = 60 * responsiveStyle;
  const outerRadius = innerRadius * 1.4;

  const getContent = useCallback(({ value, x, y, fontSize }) => {
    const positioningProps = {
      x,
      y,
      textAnchor: 'middle',
      verticalAnchor: 'middle',
    };
    return (
      <Text {...positioningProps} $fontSize={fontSize} $isExporting={isExporting}>
        {value}
      </Text>
    );
  });

  return (
    <ResponsiveContainer width="100%" height={height} aspect={isMobile() ? null : 2}>
      <BasePieChart>
        <Pie
          cy="70%"
          startAngle={180}
          endAngle={0}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          dataKey="value"
          data={elements}
          paddingAngle={2}
          isAnimationActive={!isExporting && isEnlarged}
          onClick={item => {
            onItemClick(item.originalItem);
          }}
          {...restOfConfigs}
        >
          {cellComponents}
          {/* Coordinate graph for Gauge chart: https://beyond-essential.slab.com/posts/gauge-chart-2f6rrxnj#h5p3r-how-to-add-labels-into-pie-chart-in-rechart */}
          {/* Value label on the center */}
          <Label
            content={props =>
              getContent({
                x: props.viewBox.cx,
                y: props.viewBox.cy,
                value: formatDataValueByType({ value: elements[0].value }, 'percentage'),
                fontSize: 30,
              })
            }
          />
          {/* 0 label on the left */}
          <Label
            content={props => {
              const fontSize = 15;
              return getContent({
                x: props.viewBox.cx - outerRadius + (outerRadius - innerRadius) / 2,
                y: props.viewBox.cy + fontSize,
                value: 0,
                fontSize,
              });
            }}
          />
          {/* 100% label on the left */}
          <Label
            content={props => {
              const fontSize = 15;
              return getContent({
                x: props.viewBox.cx + outerRadius - (outerRadius - innerRadius) / 2,
                y: props.viewBox.cy + fontSize,
                value: '100%',
                fontSize,
              });
            }}
          />
        </Pie>
      </BasePieChart>
    </ResponsiveContainer>
  );
};

GaugeChart.propTypes = {
  viewContent: PropTypes.shape(VIEW_CONTENT_SHAPE).isRequired,
  isEnlarged: PropTypes.bool,
  isExporting: PropTypes.bool,
  onItemClick: PropTypes.func,
};

GaugeChart.defaultProps = {
  isEnlarged: false,
  isExporting: false,
  onItemClick: () => {},
};
