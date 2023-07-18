/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { DownloadFilesVisual as BaseDownloadFilesVisual, OFF_WHITE } from '@tupaia/ui-components';
import { getUniqueFileNameParts } from '@tupaia/utils';
import { download } from '../../utils/request';

const StyledDownloadFilesVisual = styled(BaseDownloadFilesVisual)`
  .filename {
    color: ${OFF_WHITE};
  }

  .checkbox-icon {
    color: ${OFF_WHITE};
  }
`;

export const DownloadFilesVisual = ({ onClose: originalOnClose, viewContent, isEnlarged }) => {
  const [error, setError] = useState(null);

  const downloadFiles = async uniqueFileNames => {
    try {
      if (uniqueFileNames.length === 1) {
        const { fileName } = getUniqueFileNameParts(uniqueFileNames[0]);
        await download(
          `downloadFiles?uniqueFileNames=${uniqueFileNames[0]}`,
          undefined,
          {},
          fileName,
        );
      } else {
        const fileName = `tupaia-download-${new Date().toLocaleString('default', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        })}.zip`;
        const uniqueFileNamesString = uniqueFileNames.join(',');

        await download(
          `downloadFiles?uniqueFileNames=${uniqueFileNamesString}`,
          undefined,
          {},
          fileName,
        );
      }
    } catch (e) {
      setError(e.message);
    }
  };

  const onClose = () => {
    setError(null);
    originalOnClose();
  };

  const { data, ...config } = viewContent;

  return (
    <StyledDownloadFilesVisual
      data={data}
      config={config}
      isEnlarged={isEnlarged}
      onClose={onClose}
      downloadFiles={downloadFiles}
      error={error}
      isLoading={false}
    />
  );
};

DownloadFilesVisual.propTypes = {
  onClose: PropTypes.func,
};

DownloadFilesVisual.defaultProps = {
  onClose: () => {},
};
