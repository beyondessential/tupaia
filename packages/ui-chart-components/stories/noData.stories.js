/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 *
 */

import { Chart } from '../src/components/Chart';
import { DarkThemeTemplate, LightThemeChartTemplate } from './helpers';

export default {
  title: 'NoData',
  component: Chart,
};

/**
 * To test the charts,
 * - Copy a response from the tupaia-web view endpoint (full json response)
 * - Go to the controls tab of the storybook addons and paste in the response
 */

const mockData = {
  report: { data: [] },
  config: {
    name: 'Clean Drinking Water Source, % of Schools',
    type: 'chart',
    chartType: 'bar',
    valueType: 'percentage',
    chartConfig: { $all: { stackId: 1 } },
    description:
      'This report is calculated based on the number of ‘School COVID-19 Response Laos’ survey responses',
    presentationOptions: { hideAverage: true },
    renderLegendForOneItem: true,
  },
};

export const LightTheme = LightThemeChartTemplate.bind({});
LightTheme.args = {
  ...mockData,
  isEnlarged: true,
};

export const DarkTheme = DarkThemeTemplate.bind({});
DarkTheme.args = {
  ...mockData,
  isEnlarged: true,
};
DarkTheme.parameters = { theme: 'dark' };
