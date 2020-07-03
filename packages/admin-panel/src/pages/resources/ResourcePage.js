/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';

import { DataFetchingTable } from '../../table';
import { ImportModal, ExportModal, ImportButton } from '../../importExport';
import { EditModal, CreateButton } from '../../editor';
import { Body, Header, HeaderButtons, Title, Page } from '../Page';

export const ResourcePage = ({
  columns,
  createConfig,
  editConfig,
  endpoint,
  expansionTabs,
  importConfig,
  filteredExportConfig,
  onProcessDataForSave,
  title,
  baseFilter,
}) => (
  <Page>
    <Header>
      <Title>{title}</Title>
      <HeaderButtons>
        {importConfig && <ImportButton {...importConfig} />}
        {createConfig && <CreateButton {...createConfig} />}
      </HeaderButtons>
    </Header>
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
  </Page>
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
