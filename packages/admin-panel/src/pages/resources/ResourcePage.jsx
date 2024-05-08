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
import { useItemDetails } from '../../api/queries/useResourceDetails';

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
  background-color: ${({ theme }) => theme.palette.background.paper};
  border-radius: 4px;
  border: 1px solid ${({ theme }) => theme.palette.grey['400']};
  padding-inline: 0;
  max-height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const TableComponent = ({ children }) => (
  <div className="scroll-container">
    <div>{children}</div>
  </div>
);

TableComponent.propTypes = {
  children: PropTypes.node.isRequired,
};

const useEndpoint = (endpoint, details, params) => {
  if (!details && !params) return endpoint;

  const mergedDetails = { ...details, ...params };

  const replaceParams = () => {
    let updatedEndpoint = endpoint;
    Object.keys(mergedDetails).forEach(key => {
      updatedEndpoint = updatedEndpoint.replace(`{${key}}`, mergedDetails[key]);
    });
    return updatedEndpoint;
  };
  const updatedEndpoint = replaceParams();
  return updatedEndpoint;
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
  nestedView,
  parent,
  displayProperty,
  getHasNestedView,
  getDisplayValue,
  getNestedViewLink,
  basePath,
  hasBESAdminAccess,
  needsBESAdminAccess,
}) => {
  const { '*': unusedParam, locale, ...params } = useParams();
  const { data: details } = useItemDetails(params, parent);

  const { path } = nestedView || {};
  const updatedEndpoint = useEndpoint(endpoint, details, params);

  const isDetailsPage = !!parent;

  const getHasPermission = actionType => {
    if (!needsBESAdminAccess) return true;
    if (needsBESAdminAccess.includes(actionType)) return !!hasBESAdminAccess;
    return true;
  };

  const canImport = getHasPermission('import');
  const canExport = getHasPermission('export');
  const canCreate = getHasPermission('create');

  // Explode columns to support nested fields, since the table doesn't want to nest these, and then filter out columns that the user doesn't have permission to see
  const accessibleColumns = getExplodedFields(columns).filter(
    column => (column.type ? getHasPermission(column.type) : true), // If column has no type, it's always accessible
  );
  return (
    <>
      <Container>
        {isDetailsPage && (
          <Breadcrumbs
            parent={parent}
            title={title}
            displayProperty={displayProperty}
            details={details}
            getDisplayValue={getDisplayValue}
          />
        )}
        <PageHeader
          title={title}
          importConfig={canImport && importConfig}
          exportConfig={canExport && exportConfig}
          createConfig={canCreate && createConfig}
          ExportModalComponent={canExport && ExportModalComponent}
          LinksComponent={LinksComponent}
        />
        <DataFetchingTable
          endpoint={updatedEndpoint}
          reduxId={reduxId || updatedEndpoint}
          columns={accessibleColumns}
          baseFilter={baseFilter}
          defaultFilters={defaultFilters}
          TableComponent={TableComponent}
          defaultSorting={defaultSorting}
          deleteConfig={deleteConfig}
          detailUrl={path}
          getHasNestedView={getHasNestedView}
          getNestedViewLink={getNestedViewLink}
          basePath={basePath}
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
  nestedView: PropTypes.object,
  parent: PropTypes.object,
  displayProperty: PropTypes.string,
  getHasNestedView: PropTypes.func,
  getDisplayValue: PropTypes.func,
  getNestedViewLink: PropTypes.func,
  basePath: PropTypes.string,
  hasBESAdminAccess: PropTypes.bool.isRequired,
  needsBESAdminAccess: PropTypes.arrayOf(PropTypes.string),
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
  nestedView: null,
  parent: null,
  displayProperty: null,
  getHasNestedView: null,
  getDisplayValue: null,
  getNestedViewLink: null,
  basePath: '',
  needsBESAdminAccess: [],
};
