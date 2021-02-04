/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

/**
 * PieChart
 *
 * Renders a recharts PieChart from data provided by viewContent object
 * @prop {object} viewContent An object with the following structure
   {
    "type":"chart",
    "chartType":"pie",
    "name":"% Stock on Hand",
    "valueType": "percentage",
    "presentationOptions": {
      "sectorKey1": { "color": "#111111", "label": "Satanic" },
      "sectorKey2": { "color": "#222222", "label": "Nesting" },
      "sectorKey3": { "color": "#333333", "label": "HelpMe" }
    },
    "data":[{ name: "Total value stock consumables", value:24063409.4 },
            { name: "Total value stock medicines", value:24565440.6 },
            ...]
  }
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { PieChart as BasePieChart, Pie, Cell, Legend, ResponsiveContainer, Sector } from 'recharts';
import { OFF_WHITE, CHART_BLUES, CHART_COLOR_PALETTE, DARK_BLUE } from './constants';
import { isMobile, formatDataValue } from './utils';

const chartColorAtIndex = (colorArray, index) => {
  return colorArray[index % colorArray.length];
};

/**
 * Show the chart legend to the right when we're in modal view so that the visible-on-hover values aren't
 * obscured behind it. The proper Reacty way to address this would be to wrap Legend in a sub-component
 * but recharts apparently does some reflection to pass Legend its data. So, we just calculate its props
 * dynamically here.
 */
const getLegendStyles = (isExporting, isEnlarged) => {
  if (isExporting) {
    return {
      color: DARK_BLUE,
      fontSize: '11px',
    };
  }
  if (isEnlarged && !isMobile()) {
    return {
      paddingTop: '20px',
      color: 'white',
      fontSize: '12px',
    };
  }
  return {
    color: 'white',
    fontSize: '12px',
  };
};

const renderActiveShape = (shapeProps, viewContent) => {
  const { valueType, labelType } = viewContent;
  const {
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    value,
    name,
    originalItem,
  } = shapeProps;

  const RADIAN = Math.PI / 180;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const isLabelOnRight = cos >= 0;

  // We're drawing two lines:
  // - extension line, extending out from pie chart at angle = midAngle
  // - text line, horizontally from extension line endpoint to start of text
  // For the most part they can use set lengths _but_ at near-vertical angles
  // this can make text intersect other visual elements, so we need to do a
  // tiny bit more math.

  // Check if we're pointing dangerously straight-up or straight-down
  // and adjust lines to suit - shorten extension line & lengthen text line
  const adjustmentAmount = 1.5; // (just derived from eyeballing what looks ok)
  const adjustmentFactor = Math.min(1, Math.abs(cos * adjustmentAmount));

  // find start of extension line
  const extensionStartRadius = outerRadius + 10;
  const sx = cx + extensionStartRadius * cos;
  const sy = cy + extensionStartRadius * sin;

  // find end of extension line / start of text line
  const extensionEndRadius = extensionStartRadius + adjustmentFactor * 20;
  const mx = cx + extensionEndRadius * cos;
  const my = cy + extensionEndRadius * sin;

  // find end of text line
  const horizontalTooltipLineLength = 52 + (1 - adjustmentFactor) * 30;
  const ex = mx + (isLabelOnRight ? 1 : -1) * horizontalTooltipLineLength;
  const ey = my;

  const textAnchor = isLabelOnRight ? 'start' : 'end';
  const valueTypeForLabel = labelType || valueType;
  const metadataForLabel = originalItem[`${name}_metadata`];

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      <path d={`M${sx},${sy} L${mx},${my} L${ex},${ey}`} stroke={fill} fill="none" />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text x={ex + (isLabelOnRight ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#BBB">
        {name}
      </text>
      <text
        x={ex + (isLabelOnRight ? 1 : -1) * 12}
        y={ey}
        dy={18}
        textAnchor={textAnchor}
        fill="#999"
      >
        {formatDataValue(value, valueTypeForLabel, metadataForLabel)}
      </text>
    </g>
  );
};

export const PieChart = ({ viewContent, isExporting, isEnlarged, onItemClick }) => {
  const [activeIndex, setActiveIndex] = useState(-1);

  // Disable tapping charts to reveal legend labels on mobile as they do not fit and are awkwardly cropped
  const handleMouseEnter = (object, index) => {
    if (!isMobile()) {
      setActiveIndex(index);
    }
  };

  const handleMouseOut = () => {
    if (!isMobile()) {
      setActiveIndex(-1);
    }
  };

  const getPresentationOption = (key, option) => {
    const { presentationOptions } = viewContent;
    return presentationOptions && presentationOptions[key] && presentationOptions[key][option];
  };

  const getValidData = () => {
    const { data, valueType } = viewContent;

    return data
      .filter(element => element.value > 0)
      .map(item => {
        const { name, ...otherKeyValues } = item;
        // Map names to labels if available
        let label = getPresentationOption(name, 'label');
        if (!label) label = name;

        const shouldShowValue = isMobile() && isEnlarged;
        const labelSuffix = shouldShowValue ? ` (${formatDataValue(item.value, valueType)})` : '';

        return {
          name: label + labelSuffix,
          ...otherKeyValues,
          originalItem: item,
        };
      })
      .sort((a, b) => b.value - a.value);
  };

  const palette = isExporting || isEnlarged ? CHART_COLOR_PALETTE : CHART_BLUES;
  const chartColors = Object.values(palette);
  const validData = getValidData();

  // Due to the way the container margins stack, the pie chart renders
  // about 20px below the visual center when displaying in enlarged mode.
  // This makes the tooltips touch the bottom of the container
  // (and just looks a bit weird). So, bump it up by 20px.
  const offsetStyle =
    isEnlarged && !isMobile() && !isExporting ? { position: 'relative', top: '-20px' } : null;

  const responsiveStyle = !isEnlarged && !isMobile() && !isExporting ? 1.6 : undefined;

  return (
    <ResponsiveContainer width="100%" aspect={responsiveStyle}>
      <BasePieChart style={offsetStyle}>
        <Pie
          dataKey="value"
          data={validData}
          activeIndex={isExporting ? null : activeIndex}
          activeShape={shapeProps => renderActiveShape(shapeProps, viewContent)}
          onMouseOver={handleMouseEnter}
          onMouseOut={handleMouseOut}
          isAnimationActive={!isExporting && isEnlarged}
          onClick={item => {
            onItemClick(item.originalItem);
          }}
          label={isExporting}
          startAngle={360 + 90}
          endAngle={90}
        >
          {validData.map((entry, index) => {
            const fill =
              getPresentationOption(entry.originalItem.name, 'color') ||
              chartColorAtIndex(chartColors, index);
            return <Cell key={`cell-${index}`} fill={fill} stroke={OFF_WHITE} />;
          })}
        </Pie>
        <Legend
          wrapperStyle={getLegendStyles(isExporting, isEnlarged)}
          onMouseOver={handleMouseEnter}
          onMouseOut={handleMouseOut}
        />
      </BasePieChart>
    </ResponsiveContainer>
  );
};

PieChart.propTypes = {
  viewContent: PropTypes.shape({}).isRequired,
  isEnlarged: PropTypes.bool,
  isExporting: PropTypes.bool,
  onItemClick: PropTypes.func,
};

PieChart.defaultProps = {
  isEnlarged: false,
  isExporting: false,
  onItemClick: () => {},
};
