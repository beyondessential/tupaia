/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { Button, Typography } from '@material-ui/core';
import { QrCodeImage, useDownloadQrCodes } from '@tupaia/ui-components';
import { DownloadIcon as BaseDownloadIcon } from '../../../../components';

const Wrapper = styled.div`
  margin: 1.5rem 0;
`;

const QrCodeContainer = styled.div`
  canvas {
    outline: none;
    width: 100%;
  }
  border: 1px solid ${props => props.theme.palette.divider};
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.875rem;
  .MuiBox-root {
    width: 50%;
    margin: 0;
  }
`;

const EntityName = styled(Typography)`
  width: 50%;
  font-size: 1.125rem;
  font-weight: ${props => props.theme.typography.fontWeightBold};
`;

const DownloadIcon = styled(BaseDownloadIcon)`
  font-size: 1.1rem;
  margin-right: 0.5rem;
`;

const DownloadButtonText = styled.span`
  font-size: 1rem;
  line-height: 1.2;
  button:hover & {
    text-decoration: underline;
  }
`;

interface QrCodeImageProps {
  entity: {
    name: string;
    id: string;
  };
}

export const QRCode = ({ entity }: QrCodeImageProps) => {
  const { name, id } = entity;
  const { isDownloading, downloadQrCodes } = useDownloadQrCodes([
    {
      name,
      value: id,
    },
  ]);
  return (
    <Wrapper>
      <QrCodeContainer>
        <QrCodeImage qrCodeContents={id} />
        <EntityName>{name}</EntityName>
      </QrCodeContainer>
      <Button onClick={downloadQrCodes} disabled={isDownloading}>
        <DownloadIcon /> <DownloadButtonText>Download QR Code</DownloadButtonText>
      </Button>
    </Wrapper>
  );
};
