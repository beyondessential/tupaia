import { Typography } from '@material-ui/core';
import React from 'react';
import styled, { css } from 'styled-components';

import { QrCodeImage, useDownloadQrCodes } from '@tupaia/ui-components';

import { Button, DownloadIcon, ShareIcon } from '../../../components';
import { useIsMobile } from '../../../utils';
import { useShare } from '../utils/useShare';

const modalStyles = css`
  font-size: 0.875rem;
  text-decoration: none;
`;
const panelStyles = css`
  background-color: transparent;
  font-size: 1rem;
  text-decoration: underline;
`;

const Wrapper = styled.li<{
  $listVariant?: 'panel' | 'modal';
}>`
  display: flex;
  flex-direction: column;
  inline-size: 100%;
  justify-content: center;
  & + & {
    margin-block-start: 3rem;
  }

  button.MuiButtonBase-root {
    margin-left: 0;

    ~ .MuiButtonBase-root {
      margin-top: 1rem;
    }

    ${props => (props.$listVariant === 'panel' ? panelStyles : modalStyles)}
  }
`;

const QrCodeContainer = styled.div`
  align-items: center;
  border-radius: 0.1875rem;
  border: max(0.0625rem, 1px) solid ${props => props.theme.palette.divider};
  display: grid;
  grid-template-columns: auto 1fr;
  justify-content: space-between;
  margin-bottom: 1.875rem;
  padding-inline-end: 1rem;
`;

const EntityName = styled(Typography)`
  font-size: 1rem;
  ${props => props.theme.breakpoints.up('md')} {
    font-size: 1.125rem;
  }

  font-variant-numeric: lining-nums slashed-zero tabular-nums;
  font-weight: ${props => props.theme.typography.fontWeightBold};
  letter-spacing: 0.04em;
  text-align: center;
`;

const StyledQRCodeImage = styled(QrCodeImage)`
  outline: unset;
  /* 6rem at 320px viewport width, up to a maximum of 10rem at 600px */
  width: clamp(6rem, 1.4286rem + 22.8571dvw, 10rem);
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
  const isMobile = useIsMobile();
  const share = useShare();
  return (
    <Wrapper $listVariant={listVariant}>
      <QrCodeContainer>
        <StyledQRCodeImage qrCodeContents={id} />
        <EntityName>{name}</EntityName>
      </QrCodeContainer>
      <Button
        onClick={downloadQrCodes}
        disabled={isDownloading}
        variant={listVariant === 'modal' ? 'contained' : 'text'}
        color={listVariant === 'modal' ? 'primary' : 'default'}
        startIcon={<DownloadIcon />}
      >
        Download QR&nbsp;code
      </Button>
      {isMobile && (
        <Button color="primary" onClick={share} startIcon={<ShareIcon />} variant="outlined">
          Share QR&nbsp;code
        </Button>
      )}
    </Wrapper>
  );
};
