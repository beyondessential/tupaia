import React from 'react';
import styled from 'styled-components';
import DownloadIcon from '@material-ui/icons/GetApp';
import { IconButton, QrCodeImage, useDownloadQrCodes } from '@tupaia/ui-components';
import { ViewReport } from '@tupaia/types';

const DownloadButton = styled(IconButton).attrs({
  color: 'default',
})`
  position: absolute;
  top: 5px;
  right: 5px;
`;

interface SingleQRCodeProps {
  data: ViewReport['data'];
}

export const SingleQRCode = ({ data }: SingleQRCodeProps) => {
  if (!data) return null;
  const { name, value } = data[0];

  const { downloadQrCodes } = useDownloadQrCodes(data);

  return (
    <>
      <DownloadButton onClick={downloadQrCodes} title="Download QR code">
        <DownloadIcon />
      </DownloadButton>
      <QrCodeImage qrCodeContents={value as string} humanReadableId={name} />
    </>
  );
};
