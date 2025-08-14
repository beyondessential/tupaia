import React from 'react';
import { ViewConfig, ViewReport } from '@tupaia/types';
import { useDownloadFiles } from '../../../../api/mutations';
import { DownloadVisual } from './DownloadVisual';

interface DownloadFilesVisualProps {
  report: ViewReport;
  config: ViewConfig;
  isEnlarged?: boolean;
}

export const DownloadFiles = ({ report, isEnlarged }: DownloadFilesVisualProps) => {
  const { mutate: download, error, reset, isLoading } = useDownloadFiles();
  const options =
    report?.data?.map(({ label, uniqueFileName }) => ({
      value: uniqueFileName,
      label,
    })) ?? [];

  const downloadSelectedFiles = selectedValues => {
    download(Array.isArray(selectedValues) ? selectedValues : [selectedValues]);
  };

  return (
    <DownloadVisual
      options={options}
      isLoading={isLoading}
      onDownload={downloadSelectedFiles}
      isEnlarged={isEnlarged}
      error={error as Error}
      onClose={reset}
    />
  );
};
