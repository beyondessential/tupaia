import {
  BarChartConfigSchema,
  ComponentConfigSchema,
  ComposedChartConfigSchema,
  DataDownloadViewConfigSchema,
  DownloadFilesViewConfigSchema,
  GaugeChartConfigSchema,
  LineChartConfigSchema,
  MatrixConfigSchema,
  MultiPhotographViewConfigSchema,
  MultiSingleValueViewConfigSchema,
  MultiValueRowViewConfigSchema,
  MultiValueViewConfigSchema,
  PieChartConfigSchema,
  QRCodeViewConfigSchema,
  SingleDateViewConfigSchema,
  SingleDownloadLinkViewConfigSchema,
  SingleValueViewConfigSchema,
} from '../schemas';

export const VizTypesByGroup = {
  chart: ['GaugeChart', 'ComposedChart', 'BarChart', 'PieChart', 'LineChart'],
  matrix: ['Matrix'],
  view: [
    'SingleValueView',
    'MultiPhotographView',
    'MultiSingleValueView',
    'SingleDownloadLinkView',
    'MultiValueRowView',
    'DataDownloadView',
    'SingleDateView',
    'MultiValueView',
    'DownloadFilesView',
    'QRCodeView',
  ],
  component: ['Component'],
};

export const VizTypeSchemaMap: Record<string, any> = {
  GaugeChart: GaugeChartConfigSchema,
  ComposedChart: ComposedChartConfigSchema,
  BarChart: BarChartConfigSchema,
  PieChart: PieChartConfigSchema,
  LineChart: LineChartConfigSchema,
  Component: ComponentConfigSchema,
  Matrix: MatrixConfigSchema,
  SingleValueView: SingleValueViewConfigSchema,
  MultiPhotographView: MultiPhotographViewConfigSchema,
  MultiSingleValueView: MultiSingleValueViewConfigSchema,
  SingleDownloadLinkView: SingleDownloadLinkViewConfigSchema,
  MultiValueRowView: MultiValueRowViewConfigSchema,
  DataDownloadView: DataDownloadViewConfigSchema,
  SingleDateView: SingleDateViewConfigSchema,
  MultiValueView: MultiValueViewConfigSchema,
  DownloadFilesView: DownloadFilesViewConfigSchema,
  QRCodeView: QRCodeViewConfigSchema,
};

export const VizTypeNiceName: Record<string, string> = {
  GaugeChart: 'Gauge chart',
  ComposedChart: 'Composed chart',
  BarChart: 'Bar chart',
  PieChart: 'Pie chart',
  LineChart: 'Line chart',
  Component: 'Component',
  Matrix: 'Matrix',
  SingleValueView: 'Single value',
  MultiPhotographView: 'Multi photograph',
  MultiSingleValueView: 'Multi single-value',
  SingleDownloadLinkView: 'Single download link',
  MultiValueRowView: 'Multi value row',
  DataDownloadView: 'Data download',
  SingleDateView: 'Single date',
  MultiValueView: 'Multi value',
  DownloadFilesView: 'Download files',
  QRCodeView: 'QR code',
};

export const VizGroupNiceName: Record<string, string> = {
  chart: 'Chart',
  matrix: 'Matrix',
  view: 'View',
  component: 'Component',
};

/**
 * We want a single flat list of viz types, so we have this helper function which converts our 3 properties into a single key
 */
export const getVizTypeName = ({
  type,
  chartType,
  viewType,
}: {
  type?: string;
  chartType?: string;
  viewType?: string;
}) => {
  if (!type) {
    return '';
  }
  if (type === 'chart' && chartType) {
    return `${upperFirst(chartType)}Chart`;
  }
  if (type === 'view' && viewType) {
    return `${upperFirst(viewType)}View`;
  }
  if (!chartType && !viewType) {
    return `${upperFirst(type)}`;
  }
  return '';
};

const upperFirst = (text: string) => `${text.charAt(0).toUpperCase()}${text.slice(1)}`;
