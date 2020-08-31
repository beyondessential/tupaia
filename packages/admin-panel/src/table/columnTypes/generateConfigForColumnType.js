/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { EditButton } from '../../editor';
import { DeleteButton } from './DeleteButton';
import { ExportButton, FilteredExportButton } from '../../importExport';
import { BooleanSelectFilter } from './columnFilters';

const generateCustomCell = (CustomCell, actionConfig, reduxId) => props => (
  <CustomCell actionConfig={actionConfig} reduxId={reduxId} {...props} />
);

const BUTTON_WIDTH = 60;

const BUTTON_COLUMN_OPTIONS = {
  filterable: false,
  sortable: false,
};

const CUSTOM_CELL_COMPONENTS = {
  edit: EditButton,
  export: ExportButton,
  filteredExport: FilteredExportButton,
  delete: DeleteButton,
  boolean: ({ value }) => (value ? 'Yes' : 'No'),
};

const BUTTON_COLUMN_TYPES = ['edit', 'export', 'delete'];

export const generateConfigForColumnType = (type, actionConfig, reduxId) => {
  const CustomCellComponent = CUSTOM_CELL_COMPONENTS[type];
  if (!CustomCellComponent) {
    return {};
  }
  let config = {
    Cell: generateCustomCell(CustomCellComponent, actionConfig, reduxId),
  };
  if (BUTTON_COLUMN_TYPES.includes(type)) {
    config = {
      ...config,
      ...BUTTON_COLUMN_OPTIONS,
      width: BUTTON_WIDTH,
    };
  }
  if (type === 'boolean') {
    config = {
      ...config,
      Filter: BooleanSelectFilter,
    };
  }
  return config;
};
