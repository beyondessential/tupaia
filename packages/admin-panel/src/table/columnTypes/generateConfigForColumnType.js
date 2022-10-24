/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { EditButton, BulkEditButton } from '../../editor';
import { DeleteButton } from './DeleteButton';
import { ExportButton } from '../../importExport';
import { BooleanSelectFilter } from './columnFilters';
import { Tooltip, JSONTooltip } from './Tooltip';
import { LogsButton } from '../../logsTable';
import { SyncStatus } from '../../sync';

const generateCustomCell = (CustomCell, actionConfig, reduxId) => props => (
  <CustomCell actionConfig={actionConfig} reduxId={reduxId} {...props} />
);

const BUTTON_WIDTH = 60;

const BUTTON_COLUMN_OPTIONS = {
  filterable: false,
  sortable: false,
};

const ViewLink = ({ actionConfig, row }) => {
  console.log('ignore me', actionConfig.hi); // eslint thing
  return (
    <a
      href={`https://hackathon-viz-workflow.tupaia.org/ehealth_nauru/NR/COVID-19%20Cases?overlay=covid_nr_d_case_numbers&overlayPeriod=DEFAULT_PERIOD&report=${row.code}`}
    >
      View
    </a>
  );
};
ViewLink.propTypes = {
  actionConfig: PropTypes.object.isRequired,
  row: PropTypes.object.isRequired,
};

const CUSTOM_CELL_COMPONENTS = {
  bulkEdit: BulkEditButton,
  edit: EditButton,
  export: ExportButton,
  delete: DeleteButton,
  boolean: ({ value }) => (value ? 'Yes' : 'No'),
  tooltip: Tooltip,
  jsonTooltip: JSONTooltip,
  logs: LogsButton,
  sync: SyncStatus,
  view: ViewLink,
};

const BUTTON_COLUMN_TYPES = ['edit', 'export', 'delete', 'logs', 'view'];

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
