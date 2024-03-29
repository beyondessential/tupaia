/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 *
 */
import { Chart } from '../src/components/Chart';
import { DarkThemeTemplate, LightThemeChartTemplate } from './helpers';
import viewContent from './data/stackedBarChart.json';

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
  viewContent,
  isEnlarged: true,
  legendPosition: 'top',
};

export const DarkTheme = DarkThemeTemplate.bind({});
DarkTheme.args = {
  viewContent,
  isEnlarged: true,
};
DarkTheme.parameters = { theme: 'dark' };
