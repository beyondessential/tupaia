/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { DataFetchingTable } from '../../table';
import { EditModal } from '../../editor';
import { Header, PageBody } from '../../widgets';
import { usePortalWithCallback } from '../../utilities';

const Container = styled(PageBody)`
  overflow: auto;
`;

export const ResourcePage = ({
  columns,
  createConfig,
  endpoint,
  reduxId,
  expansionTabs,
  importConfig,
  ExportModalComponent,
  LinksComponent,
  onProcessDataForSave,
  baseFilter,
  title,
  getHeaderEl,
  defaultFilters,
  defaultSorting,
  displayUsedBy,
}) => {
  const HeaderPortal = usePortalWithCallback(
    <Header
      title={title}
      importConfig={importConfig}
      createConfig={createConfig}
      ExportModalComponent={ExportModalComponent}
      LinksComponent={LinksComponent}
    />,
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
          reduxId={reduxId || endpoint}
          baseFilter={baseFilter}
          defaultFilters={defaultFilters}
          defaultSorting={defaultSorting}
        />
      </Container>
      <EditModal onProcessDataForSave={onProcessDataForSave} displayUsedBy={displayUsedBy} />
    </>
  );
};

ResourcePage.propTypes = {
  getHeaderEl: PropTypes.func.isRequired,
  columns: PropTypes.array.isRequired,
  createConfig: PropTypes.object,
  onProcessDataForSave: PropTypes.func,
  endpoint: PropTypes.string.isRequired,
  reduxId: PropTypes.string,
  expansionTabs: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      endpoint: PropTypes.string,
      columns: PropTypes.array,
      expansionTabs: PropTypes.array, // For nested expansions, uses same shape.
    }),
  ),
  importConfig: PropTypes.object,
  ExportModalComponent: PropTypes.elementType,
  LinksComponent: PropTypes.elementType,
  title: PropTypes.string.isRequired,
  baseFilter: PropTypes.object,
  defaultSorting: PropTypes.array,
  defaultFilters: PropTypes.array,
  displayUsedBy: PropTypes.bool,
};

ResourcePage.defaultProps = {
  createConfig: null,
  expansionTabs: null,
  importConfig: null,
  ExportModalComponent: null,
  LinksComponent: null,
  onProcessDataForSave: null,
  baseFilter: {},
  defaultSorting: [],
  defaultFilters: [],
  reduxId: null,
  displayUsedBy: false,
};
