/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import { ViewConfig, ViewReport } from '@tupaia/types';
import { useDownloadFiles } from '../../../../api/mutations';
import { DownloadVisual } from './DownloadVisual';

interface DownloadFilesVisualProps {
  report: ViewReport;
  config: ViewConfig;
  isEnlarged?: boolean;
}

export const DownloadFiles = ({ report, isEnlarged }: DownloadFilesVisualProps) => {
  const { mutateAsync: download, error, reset, isLoading } = useDownloadFiles();
  const [isDownloading, setIsDownloading] = useState(false);
  const options =
    report?.data?.map(({ label, uniqueFileName }) => ({
      value: uniqueFileName,
      label,
    })) ?? [];

  const downloadSelectedFiles = async selectedValues => {
    try {
      setIsDownloading(true);
      await download(Array.isArray(selectedValues) ? selectedValues : [selectedValues]);
      setIsDownloading(false);
    } catch (error) {
      setIsDownloading(false);
    }
  };

  return (
    <DownloadVisual
      options={options}
      isLoading={isLoading || isDownloading}
      onDownload={downloadSelectedFiles}
      isEnlarged={isEnlarged}
      error={error as Error}
      onClose={reset}
    />
  );
};
