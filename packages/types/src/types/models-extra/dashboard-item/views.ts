/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import type { BaseConfig, ValueType } from './common';
import { CssColor } from '../../css';

type BaseViewConfig = BaseConfig &
  Record<string, unknown> & {
    valueType?: ValueType;
    value_metadata?: Record<string, unknown>;
  };

type ColorOption = {
  color: CssColor;
};

export type ListViewConfig = BaseViewConfig & {
  type: 'view';
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
  type: 'view';
  viewType: 'singleValue';
  dataColor: CssColor;
};

export type MultiPhotographViewConfig = BaseViewConfig & {
  type: 'view';
  viewType: 'multiPhotograph';
};

export type MultiSingleValueViewConfig = BaseViewConfig & {
  type: 'view';
  viewType: 'multiSingleValue';
};

export type SingleDownloadLinkViewConfig = BaseViewConfig & {
  type: 'view';
  viewType: 'singleDownloadLink';
};

type MultiValueRowOption = ColorOption & { header: string };
export type MultiValueRowViewConfig = BaseViewConfig & {
  type: 'view';
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
  type: 'view';
  viewType: 'colorList';
};

export type DataDownloadViewConfig = BaseViewConfig & {
  type: 'view';
  viewType: 'dataDownload';
};
export type SingleDateViewConfig = BaseViewConfig & {
  type: 'view';
  viewType: 'singleDate';
};

export type MultiValueViewConfig = BaseViewConfig & {
  type: 'view';
  viewType: 'multiValue';

  presentationOptions?: Record<string, ColorOption> & {
    isTitleVisible?: boolean;
    valueFormat?: string;
  };
};

export type ViewConfig =
  | SingleValueViewConfig
  | MultiPhotographViewConfig
  | MultiSingleValueViewConfig
  | SingleDownloadLinkViewConfig
  | MultiValueRowViewConfig
  | DataDownloadViewConfig
  | SingleDateViewConfig
  | MultiValueViewConfig;
