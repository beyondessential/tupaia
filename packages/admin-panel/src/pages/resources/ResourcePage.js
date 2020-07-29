/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { DataFetchingTable } from '../../table';
import { ImportModal, ExportModal, ImportButton } from '../../importExport';
import { EditModal, CreateButton } from '../../editor';
import { Body } from '../Page';

export const ResourcePage = ({
  columns,
  editConfig,
  createConfig,
  endpoint,
  expansionTabs,
  importConfig,
  filteredExportConfig,
  onProcessDataForSave,
  baseFilter,
}) => (
  <>
    {importConfig && <ImportButton {...importConfig} />}
    {createConfig && <CreateButton {...createConfig} />}
    <Body>
      <DataFetchingTable
        columns={columns}
        endpoint={endpoint}
        expansionTabs={expansionTabs}
        reduxId={endpoint}
        baseFilter={baseFilter}
      />
    </Body>
    {importConfig && <ImportModal {...importConfig} />}
    {filteredExportConfig && <ExportModal {...filteredExportConfig} />}
    <EditModal {...editConfig} onProcessDataForSave={onProcessDataForSave} />
  </>
);

ResourcePage.propTypes = {
  columns: PropTypes.array.isRequired,
  createConfig: PropTypes.object,
  editConfig: PropTypes.object,
  onProcessDataForSave: PropTypes.func,
  endpoint: PropTypes.string.isRequired,
  expansionTabs: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      endpoint: PropTypes.string,
      columns: PropTypes.array,
      expansionTabs: PropTypes.array, // For nested expansions, uses same shape.
    }),
  ),
  importConfig: PropTypes.object,
  filteredExportConfig: PropTypes.object,
  title: PropTypes.string.isRequired,
  baseFilter: PropTypes.object,
};

ResourcePage.defaultProps = {
  createConfig: null,
  editConfig: null,
  expansionTabs: null,
  importConfig: null,
  filteredExportConfig: null,
  onProcessDataForSave: null,
  baseFilter: {},
};
