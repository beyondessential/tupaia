/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { DataFetchingTable } from '../../table';
import { ImportModal, ExportModal } from '../../importExport';
import { EditModal } from '../../editor';
import { Header, PageBody } from '../../widgets';
import { usePortalWithCallback } from '../../utilities';

const Container = styled(PageBody)`
  overflow: auto;
`;

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
  title,
  getHeaderEl,
}) => {
  const HeaderPortal = usePortalWithCallback(
    <Header title={title} importConfig={importConfig} createConfig={createConfig} />,
    getHeaderEl,
  );
  return (
    <>
      {HeaderPortal}
      <Container>
        <DataFetchingTable
          columns={columns}
          endpoint={endpoint}
          expansionTabs={expansionTabs}
          reduxId={endpoint}
          baseFilter={baseFilter}
        />
      </Container>
      {importConfig && <ImportModal {...importConfig} />}
      {filteredExportConfig && <ExportModal {...filteredExportConfig} />}
      <EditModal {...editConfig} onProcessDataForSave={onProcessDataForSave} />
    </>
  );
};

ResourcePage.propTypes = {
  getHeaderEl: PropTypes.func.isRequired,
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
