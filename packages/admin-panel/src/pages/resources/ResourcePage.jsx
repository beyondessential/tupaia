/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';
import { DataFetchingTable } from '../../table';
import { EditModal } from '../../editor';
import { PageHeader } from '../../widgets';
import { getExplodedFields } from '../../utilities';
import { LogsModal } from '../../logsTable';
import { QrCodeModal } from '../../qrCode';
import { ResubmitSurveyResponseModal } from '../../surveyResponse/ResubmitSurveyResponseModal';
import { Breadcrumbs } from '../../layout';
import { useItemDetails } from '../../api/queries/useResourceDetails';

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
  nestedViews,
  parent,
  displayProperty,
  getDisplayValue,
  getNestedViewLink,
  basePath,
  hasBESAdminAccess,
  needsBESAdminAccess,
  actionLabel,
  resourceName,
}) => {
  const { '*': unusedParam, locale, ...params } = useParams();
  const { data: details } = useItemDetails(params, parent);

  // assume the first nested view is the one we want to link to and any others would be direct linked to
  const { path, getHasNestedView } = nestedViews?.[0] || {};
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
        importConfig={canImport && importConfig}
        exportConfig={canExport && exportConfig}
        createConfig={canCreate && createConfig}
        ExportModalComponent={canExport && ExportModalComponent}
        LinksComponent={LinksComponent}
        resourceName={resourceName?.singular}
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
        actionLabel={actionLabel}
      />
      <EditModal
        onProcessDataForSave={onProcessDataForSave}
        resourceName={resourceName?.singular}
        {...editorConfig}
      />
      <LogsModal />
      <QrCodeModal />
      <ResubmitSurveyResponseModal />
    </>
  );
};

ResourcePage.propTypes = {
  resourceName: PropTypes.shape({
    singular: PropTypes.string,
    plural: PropTypes.string,
  }),
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
  title: PropTypes.string,
  baseFilter: PropTypes.object,
  defaultSorting: PropTypes.array,
  defaultFilters: PropTypes.array,
  editorConfig: PropTypes.object,
  nestedViews: PropTypes.arrayOf(PropTypes.object),
  parent: PropTypes.object,
  displayProperty: PropTypes.string,
  getHasNestedView: PropTypes.func,
  getDisplayValue: PropTypes.func,
  getNestedViewLink: PropTypes.func,
  basePath: PropTypes.string,
  hasBESAdminAccess: PropTypes.bool.isRequired,
  needsBESAdminAccess: PropTypes.arrayOf(PropTypes.string),
  actionLabel: PropTypes.string,
};

ResourcePage.defaultProps = {
  resourceName: {},
  createConfig: null,
  importConfig: null,
  exportConfig: {},
  deleteConfig: {},
  ExportModalComponent: null,
  TableComponent: null,
  LinksComponent: null,
  onProcessDataForSave: null,
  title: null,
  baseFilter: {},
  defaultSorting: [],
  defaultFilters: [],
  reduxId: null,
  editorConfig: {},
  nestedViews: null,
  parent: null,
  displayProperty: null,
  getHasNestedView: null,
  getDisplayValue: null,
  getNestedViewLink: null,
  basePath: '',
  needsBESAdminAccess: [],
  actionLabel: 'Action',
};
