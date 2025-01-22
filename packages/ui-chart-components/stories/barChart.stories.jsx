import { Chart } from '../src';
import { DarkThemeTemplate, LightThemeChartTemplate } from './helpers';
import mockData from './data/barChartData.json';

export default {
  title: 'BarChart',
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
