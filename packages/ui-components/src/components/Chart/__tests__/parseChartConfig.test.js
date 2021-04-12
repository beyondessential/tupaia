/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */

import { parseChartConfig } from '../parseChartConfig';
import { CHART_COLOR_PALETTE, EXPANDED_CHART_COLOR_PALETTE } from '../constants';

const testViewJson = {
  chartType: 'bar',
  data: [
    { name: '1', timestamp: 1230000, metric1: 3, metric2: 5 },
    { name: '2', timestamp: 1240000, metric1: 4, metric2: 4 },
    { name: '3', timestamp: 1250000, metric1: 5, metric2: 3 },
    { name: '4', timestamp: 1260000, metric1: 6, metric2: 2 },
    { name: '5', timestamp: 1270000, metric1: 7, metric2: 1 },
  ],
};
const testConfig = {
  metric1: { stackId: 1 },
  metric2: { stackId: 2 },
};

describe('parseChartConfig', () => {
  it('should add correct colors based on default color palette', () => {
    expect(parseChartConfig({ ...testViewJson, chartConfig: testConfig })).toEqual({
      metric1: { stackId: 1, color: CHART_COLOR_PALETTE.blue },
      metric2: { stackId: 2, color: CHART_COLOR_PALETTE.red },
    });
  });

  it('should add any config in the dynamic key', () => {
    const chartConfig = {
      $all: { test: 'hi' },
      metric1: { stackId: 1 },
      metric2: { stackId: 2 },
    };
    const expected = {
      metric1: { stackId: 1, color: CHART_COLOR_PALETTE.blue, test: 'hi' },
      metric2: { stackId: 2, color: CHART_COLOR_PALETTE.red, test: 'hi' },
    };
    expect(parseChartConfig({ ...testViewJson, chartConfig })).toEqual(expected);
  });

  // Bad practice to rely on object ordering: https://stackoverflow.com/questions/9179680/is-it-acceptable-style-for-node-js-libraries-to-rely-on-object-key-order
  // As such this test only checks for color assignment
  it('should sort by legend order to assign colors (actual sort not tested)', () => {
    const chartConfig = {
      metric1: { stackId: 1, legendOrder: 5 },
      metric2: { stackId: 2, legendOrder: -2 },
    };
    const expected = {
      metric1: { stackId: 1, legendOrder: 5, color: CHART_COLOR_PALETTE.red },
      metric2: { stackId: 2, legendOrder: -2, color: CHART_COLOR_PALETTE.blue },
    };
    expect(parseChartConfig({ ...testViewJson, chartConfig })).toEqual(expected);
  });

  it('should use a specified palette', () => {
    const chartConfig = {
      metric1: { stackId: 1 },
      metric2: { stackId: 2 },
    };
    const expected = {
      metric1: { stackId: 1, color: EXPANDED_CHART_COLOR_PALETTE.maroon },
      metric2: { stackId: 2, color: EXPANDED_CHART_COLOR_PALETTE.red },
    };
    expect(
      parseChartConfig({
        ...testViewJson,
        chartConfig,
        colorPalette: 'EXPANDED_CHART_COLOR_PALETTE',
      }),
    ).toEqual(expected);
  });
});
