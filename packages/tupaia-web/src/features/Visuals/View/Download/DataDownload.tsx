/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import { Alert } from '@tupaia/ui-components';
import { ViewReport } from '@tupaia/types';
import { useDownloadRawData } from '../../../../api/mutations';
import { DownloadVisual } from './DownloadVisual';

const EmailDownloadAlert = styled(Alert).attrs({
  severity: 'info',
})`
  margin-bottom: 1rem;
`;

interface DataDownloadProps {
  report: ViewReport;
  isEnlarged?: boolean;
}

export const DataDownload = ({ report, isEnlarged }: DataDownloadProps) => {
  const {
    mutateAsync: fetchDownloadData,
    isLoading,
    error,
    data: downloadResponse,
  } = useDownloadRawData(report?.downloadUrl);

  const { data } = report;

  return (
    <DownloadVisual
      options={
        data?.map(({ name, value }) => ({
          label: name,
          value,
        })) ?? []
      }
      isLoading={isLoading}
      onDownload={fetchDownloadData}
      isEnlarged={isEnlarged}
      error={error as Error}
    >
      {downloadResponse?.emailTimeoutHit && (
        <EmailDownloadAlert>
          This export is taking a while, and will continue in the background. You will be emailed
          when the export process completes.
        </EmailDownloadAlert>
      )}
    </DownloadVisual>
  );
};
