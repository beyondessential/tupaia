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
import styled from 'styled-components';
import Typography from '@material-ui/core/Typography';
import { formatDataValueByType } from '@tupaia/utils';
import {
  PieChart as BasePieChart,
  Pie,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { OFF_WHITE, CHART_BLUES, CHART_COLOR_PALETTE, VIEW_CONTENT_SHAPE } from './constants';
import { getPieLegend } from './Legend';
import { isMobile } from './utils';
import { TooltipContainer } from './TooltipContainer';

const Heading = styled(Typography)`
  font-weight: 500;
  font-size: 0.875rem;
  line-height: 1rem;
  margin-bottom: 0.5rem;
`;

const Text = styled(Typography)`
  list-style: none;
  font-size: 0.875rem;
  line-height: 1rem;
  margin-bottom: 0.5rem;
`;

const makeCustomTooltip = ({ valueType, labelType }) => {
  const valueTypeForLabel = labelType || valueType;

  return props => {
    const { active, payload, label, viewContent } = props;

    if (!active || !payload || !payload.length) {
      return null;
    }

    const data = payload[0].payload;
    const { name, value, originalItem, fill } = data;
    const metadata = originalItem[`${name}_metadata`];

    return (
      <TooltipContainer>
        <Heading>{name}</Heading>
        <Text style={{ color: fill }}>
          {formatDataValueByType({ value, metadata }, valueTypeForLabel)}
        </Text>
      </TooltipContainer>
    );
  };
};

const chartColorAtIndex = (colorArray, index) => {
  return colorArray[index % colorArray.length];
};

export const PieChart = ({ viewContent, isExporting, isEnlarged, onItemClick }) => {
  const [activeIndex, setActiveIndex] = useState(-1);

  const handleMouseEnter = (event, index) => {
    setActiveIndex(index);
  };

  const handleMouseOut = () => {
    setActiveIndex(-1);
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
        const labelSuffix = shouldShowValue
          ? ` (${formatDataValueByType({ value: item.value }, valueType)})`
          : '';

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
  const offsetStyle = isEnlarged && !isMobile() && !isExporting ? { position: 'relative' } : null;

  const responsiveStyle = !isEnlarged && !isMobile() && !isExporting ? 1.6 : undefined;

  return (
    <ResponsiveContainer width="100%" aspect={responsiveStyle}>
      <BasePieChart style={offsetStyle}>
        <Pie
          dataKey="value"
          data={validData}
          activeIndex={isExporting ? null : activeIndex}
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
        <Tooltip content={makeCustomTooltip(viewContent)} />
        <Legend
          content={getPieLegend({ chartConfig: viewContent.chartConfig })}
          onMouseOver={handleMouseEnter}
          onMouseOut={handleMouseOut}
          verticalAlign="top"
          align="left"
        />
      </BasePieChart>
    </ResponsiveContainer>
  );
};

PieChart.propTypes = {
  viewContent: PropTypes.shape(VIEW_CONTENT_SHAPE).isRequired,
  isEnlarged: PropTypes.bool,
  isExporting: PropTypes.bool,
  onItemClick: PropTypes.func,
};

PieChart.defaultProps = {
  isEnlarged: false,
  isExporting: false,
  onItemClick: () => {},
};
