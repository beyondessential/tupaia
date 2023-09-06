/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { darken } from '@material-ui/core';
import { useSearchParams } from 'react-router-dom';
import { ViewConfig, ViewReport } from '@tupaia/types';
import { DownloadFilesVisual } from '@tupaia/ui-components';
import { useDownloadFiles } from '../../../api/mutations';
import { URL_SEARCH_PARAMS } from '../../../constants';

const StyledDownloadFilesVisual = styled(DownloadFilesVisual)`
  .filename {
    color: ${({ theme }) => darken(theme.palette.common.white, 0.1)};
  }
  .checkbox-icon {
    color: ${({ theme }) => darken(theme.palette.common.white, 0.1)};
  }
`;

interface DownloadFilesVisualProps {
  report: ViewReport;
  config: ViewConfig;
  isEnlarged?: boolean;
}

export const DownloadFiles = ({
  report: { data = [] },
  config,
  isEnlarged,
}: DownloadFilesVisualProps) => {
  const [urlSearchParams, setUrlSearchParams] = useSearchParams();

  const { mutate: download, error, reset } = useDownloadFiles();

  const onClose = () => {
    reset();
    urlSearchParams.delete(URL_SEARCH_PARAMS.REPORT);
    setUrlSearchParams(urlSearchParams);
  };

  const errorObj = error as Error;

  return (
    <StyledDownloadFilesVisual
      config={config}
      data={(data as unknown) as { uniqueFileName: string; label: string }[]}
      downloadFiles={download as (uniqueFileNames: string[]) => Promise<void>}
      error={errorObj?.message}
      isEnlarged={isEnlarged}
      onClose={onClose}
    />
  );
};
