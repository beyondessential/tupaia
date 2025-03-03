import React from 'react';
import PropTypes from 'prop-types';
import { ExportIcon } from '../icons';
import { makeSubstitutionsInString } from '../utilities';
import { useApiContext } from '../utilities/ApiProvider';
import { ColumnActionButton } from '../table/columnTypes/ColumnActionButton';

const buildExportQueryParameters = (rowIdQueryParameter, rowData, filterQueryParameters) => {
  if (!rowIdQueryParameter && !filterQueryParameters) return null;
  const queryParameters = rowIdQueryParameter ? { [rowIdQueryParameter]: rowData.original.id } : {};
  if (filterQueryParameters) {
    return { ...queryParameters, ...filterQueryParameters };
  }
  return queryParameters;
};

export const ExportButton = ({ actionConfig, row }) => {
  const api = useApiContext();

  const { title = 'Export record' } = actionConfig;

  return (
    <ColumnActionButton
      className="export-button"
      title={title}
      onClick={async () => {
        const { exportEndpoint, rowIdQueryParameter, extraQueryParameters, fileName } =
          actionConfig;
        const queryParameters = buildExportQueryParameters(rowIdQueryParameter, row.original);
        const endpoint = `export/${exportEndpoint}${
          !queryParameters && row.original.id ? `/${row.original.id}` : ''
        }`;
        const processedFileName = fileName
          ? makeSubstitutionsInString(fileName, row.original)
          : null;
        await api.download(
          endpoint,
          { queryParameters, ...extraQueryParameters },
          processedFileName,
        );
      }}
    >
      <ExportIcon />
    </ColumnActionButton>
  );
};

ExportButton.propTypes = {
  row: PropTypes.object.isRequired,
  actionConfig: PropTypes.object.isRequired,
};
