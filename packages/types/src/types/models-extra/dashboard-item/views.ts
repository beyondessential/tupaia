/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import { CssColor } from '../../css';
import type { BaseConfig, DashboardItemTypes, ValueType } from './common';

type BaseViewConfig = BaseConfig &
  Record<string, unknown> & {
    type: DashboardItemTypes.View;
    valueType?: ValueType;
    value_metadata?: Record<string, unknown>;
  };

type ColorOption = {
  color: CssColor;
};

export enum ViewTypes {
  List = 'list',
  SingleValue = 'singleValue',
  MultiPhotograph = 'multiPhotograph',
  MultiSingleValue = 'multiSingleValue',
  SingleDownloadLink = 'singleDownloadLink',
  MultiValueRow = 'multiValueRow',
  DataDownload = 'dataDownload',
  SingleDate = 'singleDate',
  MultiValue = 'multiValue',
  FilesDownload = 'filesDownload',
  QRCode = 'qrCodeVisual',
  ColorList = 'colorList',
}

export type ListViewConfig = BaseViewConfig & {
  viewType: ViewTypes.List;
  listConfig: {
    [key: string]: {
      color: CssColor;
      label: string;
    };
  };

  /**
   * @description If provided, performs a find and replace on list item content
   */
  valueTranslationOptions?: {
    match: string; // regex
    replace: string;
  };
};

export type SingleValueViewConfig = BaseViewConfig & {
  viewType: ViewTypes.SingleValue;
  dataColor: CssColor;
};

export type MultiPhotographViewConfig = BaseViewConfig & {
  viewType: ViewTypes.MultiPhotograph;
};

export type MultiSingleValueViewConfig = BaseViewConfig & {
  viewType: ViewTypes.MultiSingleValue;
};

export type SingleDownloadLinkViewConfig = BaseViewConfig & {
  viewType: ViewTypes.SingleDownloadLink;
};

type MultiValueRowOption = ColorOption & { header: string };
export type MultiValueRowViewConfig = BaseViewConfig & {
  viewType: ViewTypes.MultiValueRow;
  presentationOptions?: MultiValueRowOption & {
    dataPairNames?: string[];
    rowHeader?: ColorOption & { name?: string };
    leftColumn?: MultiValueRowOption;
    rightColumn?: MultiValueRowOption;
    middleColumn?: MultiValueRowOption;
  };
};

export type ColorListViewConfig = BaseViewConfig & {
  viewType: ViewTypes.ColorList;
};

export type DataDownloadViewConfig = BaseViewConfig & {
  viewType: ViewTypes.DataDownload;
};
export type SingleDateViewConfig = BaseViewConfig & {
  viewType: ViewTypes.SingleDate;
};

export type DownloadFilesViewConfig = BaseViewConfig & {
  viewType: ViewTypes.FilesDownload;
};

export type MultiValueViewConfig = BaseViewConfig & {
  viewType: ViewTypes.MultiValue;
  presentationOptions?: Record<string, ColorOption> & {
    isTitleVisible?: boolean;
    valueFormat?: string;
  };
};

export type QRCodeViewConfig = BaseViewConfig & {
  viewType: ViewTypes.QRCode;
};

export type ViewConfig =
  | ListViewConfig
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
