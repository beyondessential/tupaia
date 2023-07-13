/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { DownloadFilesVisual as BaseDownloadFilesVisual, OFF_WHITE } from '@tupaia/ui-components';
import { download } from '../../utils/request';

const StyledDownloadFilesVisual = styled(BaseDownloadFilesVisual)`
  .filename {
    color: ${OFF_WHITE};
  }
  .checkbox-icon {
    color: ${OFF_WHITE};
  }
`;

const getFilenameFromPath = fileName => fileName.split('/').at(-1);
const getZipFileName = () =>
  `tupaia-download-${new Date().toLocaleString('default', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })}.zip`;

export const DownloadFilesVisual = ({ onClose: originalOnClose, ...restOfProps }) => {
  const [error, setError] = useState(null);

  const downloadFiles = async files => {
    try {
      const filesString = files.join(',');
      const fileName = files.length === 1 ? getFilenameFromPath(files[0]) : getZipFileName();
      await download(`downloadFiles?files=${filesString}`, undefined, {}, fileName);
    } catch (e) {
      setError(e.message);
    }
  };

  const onClose = () => {
    setError(null);
    originalOnClose();
  };

  return (
    <StyledDownloadFilesVisual
      {...restOfProps}
      onClose={onClose}
      downloadFiles={downloadFiles}
      error={error}
    />
  );
};

DownloadFilesVisual.propTypes = {
  onClose: PropTypes.func,
};

DownloadFilesVisual.defaultProps = {
  onClose: () => {},
};
