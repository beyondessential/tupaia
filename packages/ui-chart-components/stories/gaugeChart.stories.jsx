import { Chart } from '../src/components/Chart';
import { LightThemeChartTemplate, DarkThemeTemplate } from './helpers';
import mockData from './data/gaugeChartData.json';

export default {
  title: 'GaugeChart',
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
  isEnlarged: false,
};

export const DarkTheme = DarkThemeTemplate.bind({});
DarkTheme.args = {
  ...mockData,
  isEnlarged: false,
};
DarkTheme.parameters = { theme: 'dark' };
