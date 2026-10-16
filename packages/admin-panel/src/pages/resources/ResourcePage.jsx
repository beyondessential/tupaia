import React from 'react';
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';
import { DataFetchingTable } from '../../table';
import { EditModal } from '../../editor';
import { PageHeader } from '../../widgets';
import { LogsModal } from '../../logsTable';
import { QrCodeModal } from '../../qrCode';
import { ResubmitSurveyResponseModal } from '../../surveyResponse/ResubmitSurveyResponseModal';
import { Breadcrumbs } from '../../layout';
import { useItemDetails } from '../../api/queries/useResourceDetails';
import { ArchiveSurveyResponseModal } from '../../surveyResponse';
import { useSelectedProjectCode } from '../../projects';
import { SINGLE_PROJECT_PATH_PARAM } from '../../routes/scopes';
import {
  getExplodedFields,
  substituteRouteParams,
  useHasBesAdminAccess,
  useHasVizBuilderAccess,
} from '../../utilities';

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
  needsBESAdminAccess,
  needsVizBuilderAccess,
  actionLabel,
  resourceName,
}) => {
  const hasBESAdminAccess = useHasBesAdminAccess();
  const hasVizBuilderAccess = useHasVizBuilderAccess();
  const { '*': unusedParam, locale, ...params } = useParams();
  const { data: details } = useItemDetails(params, parent);
  const selectedProjectCode = useSelectedProjectCode();

  // assume the first nested view is the one we want to link to and any others would be direct linked to
  const { path, getHasNestedView } = nestedViews?.[0] || {};
  // Single-project nested-view paths carry a literal `:projectCode` token (e.g.
  // `/:projectCode/surveys/:id/questions`). The row-link formatter only fills
  // params from row data (`:id`), so substitute the live projectCode here or
  // the drill-down link resolves to a non-matching route and clicking a row
  // does nothing. `:id` is intentionally left for the row formatter.
  const projectScopedParams = params[SINGLE_PROJECT_PATH_PARAM]
    ? { [SINGLE_PROJECT_PATH_PARAM]: params[SINGLE_PROJECT_PATH_PARAM] }
    : {};
  const detailUrl = path ? substituteRouteParams(path, projectScopedParams) : path;
  const resolvedBasePath = basePath ? substituteRouteParams(basePath, projectScopedParams) : basePath;
  const updatedEndpoint = useEndpoint(endpoint, details, params);

  const isDetailsPage = !!parent;

  const getHasPermission = actionType => {
    if (needsBESAdminAccess?.includes(actionType)) {
      return !!hasBESAdminAccess;
    }
    if (needsVizBuilderAccess?.includes(actionType)) {
      return !!hasVizBuilderAccess;
    }
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
        importConfig={canImport ? importConfig : null}
        exportConfig={canExport ? exportConfig : null}
        createConfig={canCreate ? createConfig : null}
        ExportModalComponent={canExport ? ExportModalComponent : null}
        /* Links component is only used for adding viz builder button */
        LinksComponent={hasVizBuilderAccess ? LinksComponent : null}
        resourceName={resourceName?.singular}
      />
      <DataFetchingTable
        endpoint={updatedEndpoint}
        reduxId={reduxId || updatedEndpoint}
        columns={accessibleColumns}
        baseFilter={baseFilter}
        defaultFilters={defaultFilters}
        defaultSorting={defaultSorting}
        deleteConfig={deleteConfig}
        detailUrl={detailUrl}
        getHasNestedView={getHasNestedView}
        getNestedViewLink={getNestedViewLink}
        basePath={resolvedBasePath}
        actionLabel={actionLabel}
        key={`${updatedEndpoint}-${selectedProjectCode ?? ''}`}
      />
      <EditModal
        onProcessDataForSave={onProcessDataForSave}
        resourceName={resourceName?.singular}
        {...editorConfig}
      />
      <LogsModal />
      <QrCodeModal />
      <ResubmitSurveyResponseModal />
      <ArchiveSurveyResponseModal />
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
