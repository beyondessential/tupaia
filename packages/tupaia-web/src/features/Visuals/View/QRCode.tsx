/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { QrCodeVisual } from '@tupaia/ui-components';
import { ViewReport } from '../../../types';
import { URL_SEARCH_PARAMS } from '../../../constants';

interface QRCodeProps {
  report: ViewReport;
  isEnlarged?: boolean;
}

export const QRCode = ({ report: { data }, isEnlarged }: QRCodeProps) => {
  const [urlSearchParams, setUrlSearchParams] = useSearchParams();
  const handleCancelDownload = () => {
    urlSearchParams.delete(URL_SEARCH_PARAMS.REPORT);
    setUrlSearchParams(urlSearchParams);
  };
  return (
    <QrCodeVisual
      data={data as any[]}
      isEnlarged={isEnlarged}
      onCloseModal={handleCancelDownload}
    />
  );
};
