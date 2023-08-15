/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { Button } from '@material-ui/core';
import DownloadIcon from '@material-ui/icons/GetApp';
import { QrCodeImage } from '../QrCodeImage';
import { Data } from '../../../types';
import { useDownloadQrCodes } from '../utils';

const DownloadButton = styled(Button)`
  position: absolute;
  top: 5px;
  right: 5px;
`;

interface SingleQrCodeProps {
  data?: Data[];
}

export const SingleQrCode = ({ data = [] }: SingleQrCodeProps) => {
  const { name, value } = data[0];

  const { downloadQrCodes } = useDownloadQrCodes(data);

  return (
    <>
      <DownloadButton onClick={downloadQrCodes} title="Download QR Code">
        <DownloadIcon />
      </DownloadButton>
      <QrCodeImage qrCodeContents={value} humanReadableId={name} />
    </>
  );
};
