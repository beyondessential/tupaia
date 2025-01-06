/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 *
 */
import { Chart } from '../src/components/Chart';
import { DarkThemeTemplate, LightThemeChartTemplate } from './helpers';
import mockData from './data/stackedBarChartData.json';

export default {
  title: 'StackedBarChart',
  component: Chart,
};

/**
 * To test the charts,
 * - Copy a response from the tupaia-web view endpoint (full json response)
 * - Go to the controls tab of the storybook addons and paste in the response
 */
export const LightTheme = LightThemeChartTemplate.bind({});
LightTheme.args = {
  ...mockData,
  isEnlarged: true,
  legendPosition: 'top',
};

export const DarkTheme = DarkThemeTemplate.bind({});
DarkTheme.args = {
  ...mockData,
  isEnlarged: true,
};
DarkTheme.parameters = { theme: 'dark' };
