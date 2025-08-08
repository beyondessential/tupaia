import { BarChartConfig, ChartConfigT, ChartReport } from '@tupaia/types';
import { ADD_TO_ALL_KEY, parseChartConfig } from '../utils';
import { CHART_COLOR_PALETTE } from '../constants';

const testChartConfig = {
  type: 'chart',
  chartType: 'bar',
  name: 'test',
  presentationOptions: {},
} as BarChartConfig;

const testReport = {
  data: [
    { name: '1', timestamp: 1230000, metric1: 3, metric2: 5, value: 10 },
    { name: '2', timestamp: 1240000, metric1: 4, metric2: 4, value: 20 },
    { name: '3', timestamp: 1250000, metric1: 5, metric2: 3, value: 30 },
    { name: '4', timestamp: 1260000, metric1: 6, metric2: 2, value: 40 },
    { name: '5', timestamp: 1270000, metric1: 7, metric2: 1, value: 50 },
  ],
  startDate: '2020-01-01',
  endDate: '2020-01-05',
} as ChartReport;

const testConfig = {
  ...testChartConfig,
  chartConfig: {},
};

describe('parseChartConfig', () => {
  it('should add correct colors based on default color palette', () => {
    const chartConfig = {
      metric1: { stackId: 1 },
      metric2: { stackId: 2 },
    };
    expect(
      parseChartConfig(testReport, {
        ...testConfig,
        chartConfig,
      }),
    ).toEqual({
      metric1: { stackId: 1, color: CHART_COLOR_PALETTE.blue },
      metric2: { stackId: 2, color: CHART_COLOR_PALETTE.red },
    });
  });

  it('should add any config in the dynamic key', () => {
    const chartConfig = {
      [ADD_TO_ALL_KEY]: { test: 'hi' },
      metric1: { stackId: 1 },
      metric2: { stackId: 2 },
    } as ChartConfigT;
    expect(
      parseChartConfig(testReport, {
        ...testConfig,
        chartConfig,
      }),
    ).toEqual({
      metric1: { stackId: 1, color: CHART_COLOR_PALETTE.blue, test: 'hi' },
      metric2: { stackId: 2, color: CHART_COLOR_PALETTE.red, test: 'hi' },
      value: {
        color: CHART_COLOR_PALETTE.purple,
        test: 'hi',
      },
    });
  });

  // Bad practice to rely on object ordering: https://stackoverflow.com/questions/9179680/is-it-acceptable-style-for-node-js-libraries-to-rely-on-object-key-order
  // As such this test only checks for color assignment
  it('should sort by legend order to assign colors (actual sort not tested)', () => {
    const chartConfig = {
      metric1: { stackId: 1, legendOrder: 5 },
      metric2: { stackId: 2, legendOrder: -2 },
    };
    expect(
      parseChartConfig(testReport, {
        ...testConfig,
        chartConfig,
      }),
    ).toEqual({
      metric1: { stackId: 1, legendOrder: 5, color: CHART_COLOR_PALETTE.red },
      metric2: { stackId: 2, legendOrder: -2, color: CHART_COLOR_PALETTE.blue },
    });
  });
});
