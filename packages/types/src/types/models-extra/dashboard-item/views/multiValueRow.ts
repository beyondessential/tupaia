/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import { BaseViewConfig, ColorOption } from './common';

type ColumnOptions = ColorOption & { header: string };

type RowHeaderOption = ColorOption & { name?: string };

export type MultiValueRowPresentationOptions = ColumnOptions & {
  dataPairNames?: string[];
  rowHeader?: RowHeaderOption;
  leftColumn?: ColumnOptions;
  rightColumn?: ColumnOptions;
  middleColumn?: ColumnOptions;
};

export type MultiValueRowViewConfig = BaseViewConfig & {
  viewType: 'multiValueRow';
  presentationOptions?: MultiValueRowPresentationOptions;
};
