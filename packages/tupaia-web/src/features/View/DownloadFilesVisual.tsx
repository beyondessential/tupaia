/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { darken } from '@material-ui/core';
import { useSearchParams } from 'react-router-dom';
import { ViewConfig } from '@tupaia/types';
import { DownloadFilesVisual as BaseDownloadFilesVisual } from '@tupaia/ui-components';
import { useDownload } from '../../api/mutations';
import { URL_SEARCH_PARAMS } from '../../constants';
import { ViewDataItem } from '../../types';

const StyledDownloadFilesVisual = styled(BaseDownloadFilesVisual)`
  .filename {
    color: ${({ theme }) => darken(theme.palette.common.white, 0.1)};
  }
  .checkbox-icon {
    color: ${({ theme }) => darken(theme.palette.common.white, 0.1)};
  }
`;

interface DownloadFilesVisualProps {
  data?: ViewDataItem & { uniqueFileName: string; label: string }[];
  config: ViewConfig;
  isEnlarged?: boolean;
}

export const DownloadFilesVisual = ({ data, config, isEnlarged }: DownloadFilesVisualProps) => {
  const [urlSearchParams, setUrlSearchParams] = useSearchParams();
  const { mutate: download, error, reset } = useDownload();

  const onClose = () => {
    reset();
    urlSearchParams.delete(URL_SEARCH_PARAMS.REPORT);
    setUrlSearchParams(urlSearchParams);
  };

  const errorObj = error as Error;

  return (
    <StyledDownloadFilesVisual
      config={config}
      data={data}
      downloadFiles={download as (uniqueFileNames: string[]) => Promise<void>}
      error={errorObj?.message}
      isEnlarged={isEnlarged}
      onClose={onClose}
    />
  );
};
