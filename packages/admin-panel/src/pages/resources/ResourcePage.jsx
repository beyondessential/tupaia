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
import { getExplodedFields, usePortalWithCallback } from '../../utilities';
import { LogsModal } from '../../logsTable';
import { QrCodeModal } from '../../qrCode';
import { ResubmitSurveyResponseModal } from '../../surveyResponse/ResubmitSurveyResponseModal';

const Container = styled(PageBody)`
  // This is a work around to put the scroll bar at the top of the section by rotating the
  // div that has overflow and then flipping back the child immediately as there is no nice
  // way in css to show the scroll bar at the top of the section
  .scroll-container {
    overflow: auto;
    transform: rotateX(180deg);

    > div {
      transform: rotateX(180deg);
    }
  }
`;

const TableComponent = ({ children }) => (
  <div className="scroll-container">
    <div>{children}</div>
  </div>
);

TableComponent.propTypes = {
  children: PropTypes.node.isRequired,
};

export const ResourcePage = ({
  columns,
  createConfig,
  endpoint,
  reduxId,
  expansionTabs,
  importConfig,
  ExportModalComponent,
  exportConfig,
  LinksComponent,
  onProcessDataForSave,
  baseFilter,
  title,
  getHeaderEl,
  defaultFilters,
  defaultSorting,
  deleteConfig,
  editorConfig,
}) => {
  const HeaderPortal = usePortalWithCallback(
    <Header
      title={title}
      importConfig={importConfig}
      exportConfig={exportConfig}
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
          columns={getExplodedFields(columns)} // Explode columns to support nested fields, since the table doesn't want to nest these
          endpoint={endpoint}
          expansionTabs={expansionTabs}
          reduxId={reduxId || endpoint}
          baseFilter={baseFilter}
          defaultFilters={defaultFilters}
          TableComponent={TableComponent}
          defaultSorting={defaultSorting}
          deleteConfig={deleteConfig}
        />
      </Container>
      <EditModal onProcessDataForSave={onProcessDataForSave} {...editorConfig} />
      <LogsModal />
      <QrCodeModal />
      <ResubmitSurveyResponseModal />
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
  exportConfig: PropTypes.object,
  deleteConfig: PropTypes.object,
  ExportModalComponent: PropTypes.elementType,
  TableComponent: PropTypes.elementType,
  LinksComponent: PropTypes.elementType,
  title: PropTypes.string.isRequired,
  baseFilter: PropTypes.object,
  defaultSorting: PropTypes.array,
  defaultFilters: PropTypes.array,
  editorConfig: PropTypes.object,
};

ResourcePage.defaultProps = {
  createConfig: null,
  expansionTabs: null,
  importConfig: null,
  exportConfig: {},
  deleteConfig: {},
  ExportModalComponent: null,
  TableComponent: null,
  LinksComponent: null,
  onProcessDataForSave: null,
  baseFilter: {},
  defaultSorting: [],
  defaultFilters: [],
  reduxId: null,
  editorConfig: {},
};
