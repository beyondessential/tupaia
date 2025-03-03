import { CssColor } from '../../../css';
import { BaseViewConfig } from './common';
import { MultiValuePresentationOptions, MultiValueViewConfig } from './multiValue';
import { MultiValueRowPresentationOptions, MultiValueRowViewConfig } from './multiValueRow';

export type SingleValueViewConfig = BaseViewConfig & {
  viewType: 'singleValue';
  dataColor?: CssColor;
};

export type MultiPhotographViewConfig = BaseViewConfig & {
  viewType: 'multiPhotograph';
};

export type MultiSingleValueViewConfig = BaseViewConfig & {
  viewType: 'multiSingleValue';
};

export type SingleDownloadLinkViewConfig = BaseViewConfig & {
  viewType: 'singleDownloadLink';
};

export type DataDownloadViewConfig = BaseViewConfig & {
  viewType: 'dataDownload';
};

export type DataDownloadViewVizBuilderConfig = DataDownloadViewConfig & {
  output: {
    type: 'rawDataExport';
  };
};
export type SingleDateViewConfig = BaseViewConfig & {
  viewType: 'singleDate';
};

export type DownloadFilesViewConfig = BaseViewConfig & {
  viewType: 'filesDownload';
};

export type QRCodeViewConfig = BaseViewConfig & {
  viewType: 'qrCodeVisual';
};

export type ViewConfig =
  | SingleValueViewConfig
  | MultiPhotographViewConfig
  | MultiSingleValueViewConfig
  | SingleDownloadLinkViewConfig
  | MultiValueRowViewConfig
  | DataDownloadViewConfig
  | SingleDateViewConfig
  | MultiValueViewConfig
  | DownloadFilesViewConfig
  | QRCodeViewConfig;

export type ViewPresentationOptions =
  | MultiValuePresentationOptions
  | MultiValueRowPresentationOptions;
