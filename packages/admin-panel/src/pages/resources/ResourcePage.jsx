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
  margin-inline: 0.6rem;
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
  detailsView,
  parent,
  displayProperty,
  getIsLink,
  getDisplayValue,
}) => {
  const { '*': unusedParam, ...params } = useParams();
  const { data: details } = useItemDetails(params, parent);

  const { to } = detailsView || {};
  const updatedEndpoint = useEndpoint(endpoint, details, params);

  const isDetailsPage = Object.keys(params).length > 0;

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
          getIsLink={getIsLink}
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
  displayProperty: PropTypes.string,
  getIsLink: PropTypes.func,
  getDisplayValue: PropTypes.func,
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
  displayProperty: null,
  getIsLink: null,
  getDisplayValue: null,
};
