import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import styled from 'styled-components';

import { VIEW_STYLES } from '../../../styles';
import { VIEW_CONTENT_SHAPE } from '../propTypes';
import { CartesianChart } from './CartesianChart';
import { CHART_TYPES } from './chartTypes';
import { PieChart } from './PieChart';
import { parseChartConfig } from './parseChartConfig';
import { getIsTimeSeries, isDataKey } from './helpers';

const UnknownChart = () => (
  <div style={VIEW_STYLES.newChartComing}>
    <h2 style={VIEW_STYLES.title}>New chart coming soon</h2>
  </div>
);

const Container = styled.div`
  // recharts components doesn't pass nested styles so they need to be added on a wrapping component
  li.recharts-legend-item {
    white-space: nowrap; // ensure there are no line breaks on the export legends
  }
`;

export class ChartWrapper extends PureComponent {
  getViewContent() {
    const { viewContent } = this.props;
    const { chartConfig, data } = viewContent;
    const massagedData = this.sortData(this.removeNonNumericData(data));
    return chartConfig
      ? {
          ...viewContent,
          data: massagedData,
          chartConfig: parseChartConfig(viewContent),
        }
      : { ...viewContent, data: massagedData };
  }

  removeNonNumericData = data =>
    data.map(dataSeries => {
      const filteredDataSeries = {};
      Object.entries(dataSeries).forEach(([key, value]) => {
        if (!isDataKey(key) || !Number.isNaN(Number(value))) {
          filteredDataSeries[key] = value;
        }
      });
      return filteredDataSeries;
    });

  sortData = data =>
    getIsTimeSeries(data) ? data.sort((a, b) => a.timestamp - b.timestamp) : data;

  render() {
    const viewContent = this.getViewContent();
    const { chartType } = viewContent;

    if (!Object.values(CHART_TYPES).includes(chartType)) {
      return <UnknownChart />;
    }

    const Chart = chartType === CHART_TYPES.PIE ? PieChart : CartesianChart;
    return (
      <div style={VIEW_STYLES.chartViewContainer}>
        <Container style={VIEW_STYLES.chartContainer}>
          <Chart {...this.props} viewContent={viewContent} />
        </Container>
      </div>
    );
  }
}

ChartWrapper.propTypes = {
  viewContent: PropTypes.shape(VIEW_CONTENT_SHAPE),
};

ChartWrapper.defaultProps = {
  viewContent: null,
};
