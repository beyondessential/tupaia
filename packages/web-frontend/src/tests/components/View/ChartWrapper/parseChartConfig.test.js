/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import { parseChartConfig } from '../../../../components/View/ChartWrapper/parseChartConfig';
import { CHART_COLOR_PALETTE } from '../../../../styles';

const testViewJson = {
  chartType: 'bar',
  data: [
    { period: '1', timestamp: 1230000, metric1: 3, metric2: 5 },
    { period: '2', timestamp: 1240000, metric1: 4, metric2: 4 },
    { period: '3', timestamp: 1250000, metric1: 5, metric2: 3 },
    { period: '4', timestamp: 1260000, metric1: 6, metric2: 2 },
    { period: '5', timestamp: 1270000, metric1: 7, metric2: 1 },
  ],
};
const testConfig = {
  metric1: { stackId: 1 },
  metric2: { stackId: 2 },
};
describe.only('parseChartConfig', () => {
  it('should add correct colors based on default color palette', () => {
    expect(parseChartConfig({ ...testViewJson, chartConfig: testConfig })).toEqual({
      metric1: { stackId: 1, color: CHART_COLOR_PALETTE.blue },
      metric2: { stackId: 2, color: CHART_COLOR_PALETTE.red },
    });
  });
  it('should add correct colors based on default color palette', () => {
    expect(
      parseChartConfig({ ...testViewJson, chartConfig: { ...testConfig, $all: { test: 'hi' } } }),
    ).toEqual({
      metric1: { stackId: 1, color: CHART_COLOR_PALETTE.blue, test: 'hi' },
      metric2: { stackId: 2, color: CHART_COLOR_PALETTE.red, test: 'hi' },
    });
  });
});
