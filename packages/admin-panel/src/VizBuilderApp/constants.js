import {
  BarChartConfigSchema,
  ColorMapOverlayConfigSchema,
  ComposedChartConfigSchema,
  DataDownloadViewVizBuilderConfigSchema,
  DownloadFilesViewConfigSchema,
  GaugeChartConfigSchema,
  IconMapOverlayConfigSchema,
  LineChartConfigSchema,
  MatrixVizBuilderConfigSchema,
  MultiPhotographViewConfigSchema,
  MultiSingleValueViewConfigSchema,
  MultiValueRowViewConfigSchema,
  MultiValueViewConfigSchema,
  PieChartConfigSchema,
  QRCodeViewConfigSchema,
  RadiusMapOverlayConfigSchema,
  ShadingMapOverlayConfigSchema,
  SingleDateViewConfigSchema,
  SingleDownloadLinkViewConfigSchema,
  SingleValueViewConfigSchema,
  SpectrumMapOverlayConfigSchema,
} from '@tupaia/types';

export const MODAL_STATUS = {
  INITIAL: 'initial',
  LOADING: 'loading',
  ERROR: 'error',
  SUCCESS: 'success',
};

export const DASHBOARD_ITEM_OR_MAP_OVERLAY_PARAM = {
  DASHBOARD_ITEM: 'dashboard-item',
  MAP_OVERLAY: 'map-overlay',
};

export const DASHBOARD_ITEM_VIZ_TYPES = {
  // Charts
  PIE_CHART: {
    name: 'Pie Chart',
    schema: PieChartConfigSchema,
    initialConfig: {
      type: 'chart',
      chartType: 'pie',
    },
  },
  LINE_CHART: {
    name: 'Line Chart',
    schema: LineChartConfigSchema,
    initialConfig: {
      type: 'chart',
      chartType: 'line',
    },
  },
  BAR_CHART: {
    name: 'Bar Chart',
    schema: BarChartConfigSchema,
    initialConfig: {
      type: 'chart',
      chartType: 'bar',
    },
  },
  GAUGE_CHART: {
    name: 'Gauge Chart',
    schema: GaugeChartConfigSchema,
    initialConfig: {
      type: 'chart',
      chartType: 'gauge',
    },
  },
  COMPOSED_CHART: {
    name: 'Composed Chart',
    schema: ComposedChartConfigSchema,
    initialConfig: {
      type: 'chart',
      chartType: 'composed',
    },
  },

  // Views
  SINGE_VALUE_VIEW: {
    name: 'Single Value View',
    schema: SingleValueViewConfigSchema,
    initialConfig: {
      type: 'view',
      viewType: 'singleValue',
    },
  },
  MULTI_VALUE_VIEW: {
    name: 'Multi Value View',
    schema: MultiValueViewConfigSchema,
    initialConfig: {
      type: 'view',
      viewType: 'multiValue',
    },
  },
  MULTI_VALUE_ROW_VIEW: {
    name: 'Multi Value Row View',
    schema: MultiValueRowViewConfigSchema,
    initialConfig: {
      type: 'view',
      viewType: 'multiValueRow',
    },
  },
  MULTI_PHOTOGRAPH_VIEW: {
    name: 'Multi Photograph View',
    schema: MultiPhotographViewConfigSchema,
    initialConfig: {
      type: 'view',
      viewType: 'multiPhotograph',
    },
  },
  MULTI_SINGLE_VALUE_VALUE: {
    name: 'Multi Single Value View',
    schema: MultiSingleValueViewConfigSchema,
    initialConfig: {
      type: 'view',
      viewType: 'multiSingleValue',
    },
  },
  SINGLE_DOWNLOAD_LINK_VIEW: {
    name: 'Single Download Link View',
    schema: SingleDownloadLinkViewConfigSchema,
    initialConfig: {
      type: 'view',
      viewType: 'singleDownloadLink',
    },
  },
  DATA_DOWNLOAD_VIEW: {
    name: 'Data Download View',
    schema: DataDownloadViewVizBuilderConfigSchema,
    vizMatchesType: viz => viz.type === 'view' && viz.viewType === 'dataDownload',
    initialConfig: {
      type: 'view',
      viewType: 'dataDownload',
      output: {
        type: 'rawDataExport',
      },
    },
  },
  SINGLE_DATE_VIEW: {
    name: 'Single Date View',
    schema: SingleDateViewConfigSchema,
    initialConfig: {
      type: 'view',
      viewType: 'singleDate',
    },
  },
  DOWNLOAD_FILES_VIEW: {
    name: 'Download Files View',
    schema: DownloadFilesViewConfigSchema,
    initialConfig: {
      type: 'view',
      viewType: 'downloadFiles',
    },
  },
  QR_CODE_VIEW: {
    name: 'QR Code View',
    schema: QRCodeViewConfigSchema,
    initialConfig: {
      type: 'view',
      viewType: 'qrCodeVisual',
    },
  },

  // Matrix
  MATRIX: {
    name: 'Matrix',
    schema: MatrixVizBuilderConfigSchema,
    vizMatchesType: viz => viz.type === 'matrix',
    initialConfig: {
      type: 'matrix',
      output: {
        type: 'matrix',
        rowField: '',
      },
    },
  },

  // This must be defined at the bottom of this object
  OTHER: {
    name: 'Other',
    schema: { type: 'object' },
    initialConfig: {},
  },
};

export const MAP_OVERLAY_VIZ_TYPES = {
  ICON: {
    name: 'Icon',
    schema: IconMapOverlayConfigSchema,
    vizMatchesType: viz => viz.displayType === 'icon',
    initialConfig: {
      displayType: 'icon',
      icon: 'pin',
    },
  },
  COLOR: {
    name: 'Color',
    schema: ColorMapOverlayConfigSchema,
    initialConfig: {
      displayType: 'color',
    },
  },
  RADIUS: {
    name: 'Radius',
    schema: RadiusMapOverlayConfigSchema,
    initialConfig: {
      displayType: 'radius',
    },
  },
  SHADING: {
    name: 'Shading',
    schema: ShadingMapOverlayConfigSchema,
    initialConfig: {
      displayType: 'shading',
    },
  },
  SPECTRUM: {
    name: 'Spectrum',
    schema: SpectrumMapOverlayConfigSchema,
    vizMatchesType: viz => viz.displayType === 'shaded-spectrum',
    initialConfig: {
      displayType: 'shaded-spectrum',
      scaleColorScheme: 'default',
      scaleType: 'gpi',
    },
  },

  // This must be defined at the bottom of this object
  OTHER: {
    name: 'Other',
    schema: { type: 'object' },
    initialConfig: {},
  },
};
