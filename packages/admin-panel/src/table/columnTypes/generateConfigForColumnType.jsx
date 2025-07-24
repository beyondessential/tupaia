import React from 'react';
import { DeleteButton } from './DeleteButton';
import { ExportButton } from '../../importExport';
import { BooleanSelectFilter } from './columnFilters';
import { Tooltip, JSONTooltip } from './Tooltip';
import { LogsButton } from '../../logsTable';
import { SyncStatus } from '../../sync';
import { EditButton } from './EditButton';
import { BulkEditButton } from './BulkEditButton';
import { TestDatabaseConnectionButton } from './TestDatabaseConnectionButton';
import { QrCodeButton } from './QrCodeButton';
import { ResubmitSurveyResponseButton } from './ResubmitSurveyResponseButton';
import { ExternalLinkButton } from './ExternalLinkButton';
import { ArchiveSurveyResponseButton } from './ArchiveSurveyResponseButton';

const generateCustomCell = (CustomCell, actionConfig) => {
  return props => <CustomCell actionConfig={actionConfig} {...props} />;
};

const BUTTON_COLUMN_OPTIONS = {
  filterable: false,
  disableSortBy: true,
  isButtonColumn: true,
  disableResizing: true,
  width: 60,
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
  testDatabaseConnection: TestDatabaseConnectionButton,
  qrCode: QrCodeButton,
  resubmitSurveyResponse: ResubmitSurveyResponseButton,
  externalLink: ExternalLinkButton,
  archive: ArchiveSurveyResponseButton,
};

const BUTTON_COLUMN_TYPES = [
  'edit',
  'export',
  'delete',
  'logs',
  'resubmitSurveyResponse',
  'qrCode',
  'testDatabaseConnection',
  'bulkEdit',
  'externalLink',
  'sync',
  'archive',
];

export const generateConfigForColumnType = (type = 'tooltip', actionConfig) => {
  const CustomCellComponent = CUSTOM_CELL_COMPONENTS[type];
  if (!CustomCellComponent) {
    return {};
  }

  const Cell = generateCustomCell(CustomCellComponent, actionConfig);

  if (BUTTON_COLUMN_TYPES.includes(type)) {
    return {
      Cell,
      ...BUTTON_COLUMN_OPTIONS,
    };
  }
  const config = {
    Cell,
    minWidth: 120, // so that the filter input is not too small
  };
  if (type === 'boolean') {
    config.Filter = BooleanSelectFilter;
  }

  return config;
};
