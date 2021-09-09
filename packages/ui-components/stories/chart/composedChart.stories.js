/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import { Chart } from '../../src/components/Chart';
import { LightThemeChartTemplate, DarkThemeTemplate } from './helpers';
import viewContent from './data/composedChartViewContent.json';

export default {
  title: 'Chart/ComposedChart',
  component: Chart,
};

/**
 * To test the charts,
 * - Copy a response from the web-frontend view endpoint (full json response)
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
