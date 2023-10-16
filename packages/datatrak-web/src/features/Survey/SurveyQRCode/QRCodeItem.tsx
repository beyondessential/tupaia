/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { Typography } from '@material-ui/core';
import { QrCodeImage, useDownloadQrCodes } from '@tupaia/ui-components';
import { DownloadIcon as BaseDownloadIcon, Button } from '../../../components';

const Wrapper = styled.li<{
  $listVariant?: 'panel' | 'modal';
}>`
  margin: 1.5rem 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  &:first-child {
    margin-top: 0;
  }
  button {
    .MuiButton-label {
      font-size: ${({ $listVariant }) => ($listVariant === 'modal' ? '0.875rem' : '1rem')};
    }
    &:hover {
      background-color: ${({ $listVariant }) => $listVariant === 'panel' && 'transparent'};
      text-decoration: ${({ $listVariant }) => ($listVariant === 'modal' ? 'none' : 'underline')};
    }
  }
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

const DownloadIcon = styled(BaseDownloadIcon)<{
  $listVariant?: 'panel' | 'modal';
}>`
  font-size: 1.1rem;
  margin-right: 0.5rem;
`;

interface QrCodeImageProps {
  entity: {
    name: string;
    id: string;
  };
  listVariant?: 'panel' | 'modal';
}

export const QRCodeItem = ({ entity, listVariant }: QrCodeImageProps) => {
  const { name, id } = entity;
  const { isDownloading, downloadQrCodes } = useDownloadQrCodes([
    {
      name,
      value: id,
    },
  ]);
  return (
    <Wrapper $listVariant={listVariant}>
      <QrCodeContainer>
        <QrCodeImage qrCodeContents={id} />
        <EntityName>{name}</EntityName>
      </QrCodeContainer>
      <Button
        onClick={downloadQrCodes}
        disabled={isDownloading}
        variant={listVariant === 'modal' ? 'contained' : 'text'}
        color={listVariant === 'modal' ? 'primary' : 'default'}
      >
        <DownloadIcon $listVariant={listVariant} /> Download QR Code
      </Button>
    </Wrapper>
  );
};
