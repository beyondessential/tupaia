/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */

import { Chart } from '../../src/components/Chart';
import { DarkThemeTemplate, LightThemeChartTemplate } from './helpers';

export default {
  title: 'Chart/NoData',
  component: Chart,
};

/**
 * To test the charts,
 * - Copy a response from the web-frontend view endpoint (full json response)
 * - Go to the controls tab of the storybook addons and paste in the response
 */

const viewContent = {
  data: [],
  viewId: 'Laos_Schools_Drinking_Water_Source_By_School_Type',
  organisationUnitCode: 'LA_Bokeo',
  dashboardGroupId: '341',
  name: 'Clean Drinking Water Source, % of Schools',
  type: 'chart',
  chartType: 'bar',
  valueType: 'percentage',
  chartConfig: { $all: { stackId: 1 } },
  description:
    'This report is calculated based on the number of ‘School COVID-19 Response Laos’ survey responses',
  presentationOptions: { hideAverage: true },
  renderLegendForOneItem: true,
};

export const LightTheme = LightThemeChartTemplate.bind({});
LightTheme.args = {
  viewContent,
  isEnlarged: true,
};

export const DarkTheme = DarkThemeTemplate.bind({});
DarkTheme.args = {
  viewContent,
  isEnlarged: true,
};
DarkTheme.parameters = { theme: 'dark' };
