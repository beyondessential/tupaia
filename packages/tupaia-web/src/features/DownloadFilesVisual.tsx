/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { darken } from '@material-ui/core';
import { DownloadFilesVisual as BaseDownloadFilesVisual } from '@tupaia/ui-components';
import { get } from '../api';
async function download(url) {
  return get(url);
}

export const OFF_WHITE = '#eeeeee';

const StyledDownloadFilesVisual = styled(BaseDownloadFilesVisual)`
  .filename {
    color: ${OFF_WHITE};
    color: ${({ theme }) => darken(theme.palette.common.white, 0.1)};
  }
  .checkbox-icon {
    color: ${OFF_WHITE};
    color: ${({ theme }) => darken(theme.palette.common.white, 0.1)};
  }
`;

const getFilenameFromPath = fileName => fileName.split('/').at(-1);
const getZipFileName = () =>
  `tupaia-download-${new Date().toLocaleString('default', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })}.zip`;

export const DownloadFilesVisual = ({ onClose: originalOnClose, data, config, isEnlarged }) => {
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
      config={config}
      data={data}
      onClose={onClose}
      downloadFiles={downloadFiles}
      error={error}
      isEnlarged={isEnlarged}
    />
  );
};

DownloadFilesVisual.propTypes = {
  onClose: PropTypes.func,
};

DownloadFilesVisual.defaultProps = {
  onClose: () => {},
};
