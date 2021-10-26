/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import ExportIcon from '@material-ui/icons/GetApp';
import { IconButton } from '../widgets';
import { makeSubstitutionsInString } from '../utilities';
import { useApi } from '../utilities/ApiProvider';

const buildExportQueryParameters = (rowIdQueryParameter, rowData, filterQueryParameters) => {
  if (!rowIdQueryParameter && !filterQueryParameters) return null;
  const queryParameters = rowIdQueryParameter ? { [rowIdQueryParameter]: rowData.id } : {};
  if (filterQueryParameters) {
    return { ...queryParameters, ...filterQueryParameters };
  }
  return queryParameters;
};

export const ExportButton = ({ actionConfig, row }) => {
  const api = useApi();

  return (
    <IconButton
      onClick={async () => {
        const {
          exportEndpoint,
          rowIdQueryParameter,
          extraQueryParameters,
          fileName,
        } = actionConfig;
        const queryParameters = buildExportQueryParameters(rowIdQueryParameter, row);
        const endpoint = `export/${exportEndpoint}${
          !queryParameters && row.id ? `/${row.id}` : ''
        }`;
        const processedFileName = makeSubstitutionsInString(fileName, row);
        await api.download(
          endpoint,
          { queryParameters, ...extraQueryParameters },
          processedFileName,
        );
      }}
    >
      <ExportIcon />
    </IconButton>
  );
};

ExportButton.propTypes = {
  row: PropTypes.object.isRequired,
  actionConfig: PropTypes.object.isRequired,
};
