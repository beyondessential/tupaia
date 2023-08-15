/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import type { BaseConfig, ValueType } from './common';
import { CssColor } from '../../css';

type BaseViewConfig = BaseConfig &
  Record<string, unknown> & {
    type: 'view';
    valueType?: ValueType;
    value_metadata?: Record<string, unknown>;
  };

type ColorOption = {
  color: CssColor;
};

export type ListViewConfig = BaseViewConfig & {
  viewType: 'list';
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
  viewType: 'singleValue';
  dataColor: CssColor;
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

type MultiValueRowOption = ColorOption & { header: string };
export type MultiValueRowViewConfig = BaseViewConfig & {
  viewType: 'multiValueRow';
  presentationOptions?: MultiValueRowOption & {
    dataPairNames?: string[];
    rowHeader?: ColorOption & { name?: string };
    leftColumn?: MultiValueRowOption;
    rightColumn?: MultiValueRowOption;
    middleColumn?: MultiValueRowOption;
  };
};

export type ColorListViewConfig = BaseViewConfig & {
  viewType: 'colorList';
};

export type DataDownloadViewConfig = BaseViewConfig & {
  viewType: 'dataDownload';
};
export type SingleDateViewConfig = BaseViewConfig & {
  viewType: 'singleDate';
};

export type DownloadFilesViewConfig = BaseViewConfig & {
  viewType: 'filesDownload';
};

export type MultiValueViewConfig = BaseViewConfig & {
  viewType: 'multiValue';
  presentationOptions?: Record<string, ColorOption> & {
    isTitleVisible?: boolean;
    valueFormat?: string;
  };
};

export type QRCodeViewConfig = BaseViewConfig & {
  viewType: 'qrCodeVisual';
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
  | DownloadFilesViewConfig;
