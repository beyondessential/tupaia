/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { useParams } from 'react-router-dom';
import { DataFetchingTable } from '../../table';
import { EditModal } from '../../editor';
import { PageHeader, PageBody } from '../../widgets';
import { getExplodedFields } from '../../utilities';
import { LogsModal } from '../../logsTable';
import { QrCodeModal } from '../../qrCode';
import { ResubmitSurveyResponseModal } from '../../surveyResponse/ResubmitSurveyResponseModal';
import { Breadcrumbs } from '../../layout';

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
  importConfig,
  ExportModalComponent,
  exportConfig,
  LinksComponent,
  onProcessDataForSave,
  baseFilter,
  title,
  defaultFilters,
  defaultSorting,
  deleteConfig,
  editorConfig,
  detailsView,
  parent,
  displayValue,
}) => {
  const params = useParams();

  const replaceParams = () => {
    if (!endpoint) return null;
    let updatedEndpoint = endpoint;
    Object.keys(params).forEach(key => {
      updatedEndpoint = endpoint.replace(`{${key}}`, params[key]);
    });
    return updatedEndpoint;
  };
  const { to } = detailsView || {};

  const updatedEndpoint = replaceParams();
  return (
    <>
      <Container>
        <Breadcrumbs parent={parent} title={title} displayValue={displayValue} />
        <PageHeader
          title={title}
          importConfig={importConfig}
          exportConfig={exportConfig}
          createConfig={createConfig}
          ExportModalComponent={ExportModalComponent}
          LinksComponent={LinksComponent}
        />
        <DataFetchingTable
          columns={getExplodedFields(columns)} // Explode columns to support nested fields, since the table doesn't want to nest these
          endpoint={updatedEndpoint}
          reduxId={reduxId || updatedEndpoint}
          baseFilter={baseFilter}
          defaultFilters={defaultFilters}
          TableComponent={TableComponent}
          defaultSorting={defaultSorting}
          deleteConfig={deleteConfig}
          detailUrl={to}
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
  columns: PropTypes.array.isRequired,
  createConfig: PropTypes.object,
  onProcessDataForSave: PropTypes.func,
  endpoint: PropTypes.string.isRequired,
  reduxId: PropTypes.string,
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
  detailsView: PropTypes.object,
  parent: PropTypes.object,
  displayValue: PropTypes.string,
};

ResourcePage.defaultProps = {
  createConfig: null,
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
  detailsView: null,
  parent: null,
  displayValue: null,
};
