/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
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
 * @return {React.PureComponent}
 */

import { PieChart as BasePieChart, Pie, Cell, Legend, ResponsiveContainer, Sector } from 'recharts';
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import { OFF_WHITE, VIEW_STYLES, CHART_BLUES, CHART_COLOR_PALETTE } from '../../../styles';
import { isMobile, formatDataValue } from '../../../utils';

const chartColorAtIndex = (colorArray, index) => {
  return colorArray[index % colorArray.length];
};

export class PieChart extends PureComponent {
  // Disable tapping charts to reveal legend labels on mobile as they do not fit and are awkwardly cropped

  constructor(props) {
    super(props);
    this.state = {
      activeIndex: -1,
    };

    this.onItemClick = this.onItemClick.bind(this);
  }

  onItemClick(item) {
    this.props.onItemClick(item.originalItem);
  }

  getLegendProps() {
    const { isExporting, isEnlarged } = this.props;

    // Show the chart legend to the right when we're in modal view so that the
    // visible-on-hover values aren't obscured behind it.
    //
    // The proper Reacty way to address this would be to wrap Legend in a
    // sub-component but recharts apparently does some reflection to pass Legend
    // its data. So, we just calculate its props dynamically here.
    if (isExporting) {
      return {
        wrapperStyle: VIEW_STYLES.legendExporting,
      };
    }
    if (isEnlarged && !isMobile()) {
      return {
        wrapperStyle: {
          paddingTop: '20px',
          ...VIEW_STYLES.legend,
        },
      };
    }
    return {
      wrapperStyle: VIEW_STYLES.legend,
    };
  }

  handleMouseEnter = (object, index) => {
    if (!isMobile()) {
      this.setState({
        activeIndex: index,
      });
    }
  };

  handleMouseOut = (object, index) => {
    if (!isMobile()) {
      this.setState({
        activeIndex: -1,
      });
    }
  };

  getValidData = () => {
    const { data, valueType } = this.props.viewContent;
    return data
      .filter(element => element.value > 0)
      .map(item => {
        const { name, ...otherKeyValues } = item;
        // Map names to labels if available
        let label = this.getPresentationOption(name, 'label');
        if (!label) label = name;

        const shouldShowValue = isMobile() && this.props.isEnlarged;
        const labelSuffix = shouldShowValue ? ` (${formatDataValue(item.value, valueType)})` : '';

        return {
          name: label + labelSuffix,
          ...otherKeyValues,
          originalItem: item,
        };
      })
      .sort((a, b) => b.value - a.value);
  };

  getPresentationOption = (key, option) => {
    const { presentationOptions } = this.props.viewContent;
    return presentationOptions && presentationOptions[key] && presentationOptions[key][option];
  };

  renderActiveShape = props => {
    const { valueType, labelType } = this.props.viewContent;
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
    } = props;

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

  render() {
    const { isEnlarged, isExporting } = this.props;
    const palette = isExporting || isEnlarged ? CHART_COLOR_PALETTE : CHART_BLUES;
    const chartColors = Object.values(palette);
    const validData = this.getValidData();

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
            activeIndex={isExporting ? null : this.state.activeIndex}
            activeShape={this.renderActiveShape}
            onMouseOver={this.handleMouseEnter}
            onMouseOut={this.handleMouseOut}
            isAnimationActive={isEnlarged}
            onClick={this.onItemClick}
            label={isExporting}
            startAngle={360 + 90}
            endAngle={90}
          >
            {validData.map((entry, index) => {
              const fill =
                this.getPresentationOption(entry.originalItem.name, 'color') ||
                chartColorAtIndex(chartColors, index);
              return <Cell key={`cell-${index}`} fill={fill} stroke={OFF_WHITE} />;
            })}
          </Pie>
          <Legend
            {...this.getLegendProps()}
            onMouseOver={this.handleMouseEnter}
            onMouseOut={this.handleMouseOut}
          />
        </BasePieChart>
      </ResponsiveContainer>
    );
  }
}

PieChart.propTypes = {
  viewContent: PropTypes.shape({}).isRequired,
  isEnlarged: PropTypes.bool,
  onItemClick: PropTypes.func,
};

PieChart.defaultProps = {
  isEnlarged: false,
  onItemClick: () => {},
};
