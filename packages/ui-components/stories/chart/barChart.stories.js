/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import { Chart } from '../../src/components/Chart';
import { DarkThemeTemplate, LightThemeChartTemplate } from './helpers';
import viewContent from './data/barChartViewContent.json';

export default {
  title: 'Chart/BarChart',
  component: Chart,
};

/**
 * To test the charts,
 * - Copy a response from the web-frontend view endpoint (full json response)
 * - Go to the controls tab of the storybook addons and paste in the response
 */
export const LightTheme = LightThemeChartTemplate.bind({});
LightTheme.args = {
  viewContent: {
    ...viewContent,
    presentationOptions: {
      ...viewContent.presentationOptions,
      hideExportValues: true,
      exportDataTable: true,
    },
  },
  isEnlarged: true,
  isExporting: true,
  legendPosition: 'top',
};

export const DarkTheme = DarkThemeTemplate.bind({});
DarkTheme.args = {
  viewContent,
  isEnlarged: true,
};
DarkTheme.parameters = { theme: 'dark' };
