/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import ImportExportIcon from '@material-ui/icons/ImportExport';
import { IconButton } from '../widgets';
import { makeSubstitutionsInString } from '../utilities';
import { api } from '../api';

const buildExportQueryParameters = (rowIdQueryParameter, rowData, filterQueryParameters) => {
  if (!rowIdQueryParameter && !filterQueryParameters) return null;
  const queryParameters = rowIdQueryParameter ? { [rowIdQueryParameter]: rowData.id } : {};
  if (filterQueryParameters) {
    return { ...queryParameters, ...filterQueryParameters };
  }
  return queryParameters;
};

const processFileName = (unprocessedFileName, rowData) => {
  const fileName = makeSubstitutionsInString(unprocessedFileName, rowData);
  return `${fileName}.xlsx`;
};

export const ExportButton = ({ actionConfig, row }) => (
  <IconButton
    onClick={async () => {
      const { exportEndpoint, rowIdQueryParameter, fileName } = actionConfig;
      const queryParameters = buildExportQueryParameters(rowIdQueryParameter, row);
      const endpoint = `export/${exportEndpoint}${!queryParameters && row.id ? `/${row.id}` : ''}`;
      const processedFileName = processFileName(fileName, row);
      await api.download(endpoint, queryParameters, processedFileName);
    }}
  >
    <ImportExportIcon />
  </IconButton>
);

ExportButton.propTypes = {
  row: PropTypes.object.isRequired,
  actionConfig: PropTypes.object.isRequired,
};
