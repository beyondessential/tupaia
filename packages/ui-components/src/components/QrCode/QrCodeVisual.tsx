/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import {
  Button,
  Checkbox,
  DialogActions,
  FormControl,
  FormControlLabel,
  FormGroup,
  Typography,
  Grid,
  Container,
} from '@material-ui/core';
import { ViewConfig } from '@tupaia/types';
import CheckboxIcon from '@material-ui/icons/CheckBox';
import DownloadIcon from '@material-ui/icons/GetApp';
import { NoData } from '../NoData';
import { QrCodeImage } from './QrCodeImage';
import { getCanvasUrlForDownload } from './useQrCodeCanvas';

const FormContainer = styled.div`
  display: flex;
  justify-content: center;
  padding: 0 2.5rem 1.875rem 2.5rem;
`;

const Error = styled.div`
  color: ${props => props.theme.palette.error.main};
  margin-top: 0.625rem;
  text-align: center;
`;

interface DownloadQrCodeVisualProps {
  downloadImages: (
    qrCodeCanvasUrlsWithFileNames: { name: string; url: string | null }[],
  ) => Promise<void>;
  config?: ViewConfig;
  data?: { name: string; value: string }[];
  isLoading?: boolean;
  isEnlarged?: boolean;
  onClose: () => void;
  className?: string;
  error?: string;
}

export const QrCodeVisual = ({
  downloadImages,
  config,
  data: options = [],
  isLoading,
  isEnlarged,
  onClose,
  className,
  error,
}: DownloadQrCodeVisualProps) => {
  const noneSelected = Object.fromEntries(options.map(({ value }) => [value, false]));
  const [selectedQrCodes, setSelectedQrCodes] = useState(noneSelected);

  const toggleSelectFile = (value: string) =>
    setSelectedQrCodes({ ...selectedQrCodes, [value]: !selectedQrCodes[value] });

  const [isDownloading, setIsDownloading] = useState(false);

  const downloadSelectedQrCodes = async () => {
    setIsDownloading(true);

    const selectedItemValues = Object.entries(selectedQrCodes)
      .filter(([, isSelected]) => isSelected)
      .map(([itemValue]) => itemValue);

    const qrCodeCanvasUrlsWithFileNames = await Promise.all(
      options
        .filter(({ value }) => selectedItemValues.includes(value))
        .map(async ({ name, value }) => {
          const url = await getCanvasUrlForDownload(name, value);
          return {
            url,
            name,
          };
        }),
    );

    await downloadImages(qrCodeCanvasUrlsWithFileNames);
    setIsDownloading(false);
  };

  if (!isEnlarged) {
    if (options.length > 1) {
      return (
        <Container className={className} maxWidth="sm">
          <p style={{ color: 'white', textAlign: 'center' }}>QR Code</p>
          {options
            .filter((option, index) => index < 6)
            .map(({ name, value }) => (
              <Grid container style={{ paddingBottom: 5 }} alignContent="center">
                <Grid item alignItems="flex-end" xs={6}>
                  <QrCodeImage
                    qrCodeContents={value}
                    humanReadableId={name}
                    width={50}
                    margin="auto"
                  />
                </Grid>
                <Grid item alignItems="flex-start" xs={6} style={{ justifyItems: 'center' }}>
                  <Typography variant="body2" style={{ color: 'white' }}>
                    {name}
                  </Typography>
                </Grid>
              </Grid>
            ))}
        </Container>
      );
    }
    const option = options[0];
    return (
      <Container>
        <p style={{ color: 'white', textAlign: 'center' }}>QR Code</p>
        <Button style={{ position: 'absolute', top: '5px', right: '5px' }}>
          <DownloadIcon onClick={() => downloadSelectedQrCodes()} />
        </Button>
        <QrCodeImage qrCodeContents={option.value} humanReadableId={option.name} />
      </Container>
    );
  }

  if (!isLoading && options.length === 0) {
    return (
      <Container className={className}>
        <NoData viewContent={config} />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className={className}>
        <Error>{error}</Error>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
        </DialogActions>
      </Container>
    );
  }

  return (
    <Container className={className}>
      <FormContainer>
        <FormControl>
          <FormGroup>
            {options.map(({ name, value }) => (
              <FormControlLabel
                key={value}
                control={
                  <Checkbox
                    checked={selectedQrCodes[value]}
                    checkedIcon={<CheckboxIcon className="checkbox-icon" />}
                    onChange={() => toggleSelectFile(value)}
                    value={value}
                  />
                }
                label={name}
              />
            ))}
          </FormGroup>
        </FormControl>
      </FormContainer>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          color="primary"
          onClick={() => downloadSelectedQrCodes()}
          variant="contained"
          disabled={
            isDownloading || Object.values(selectedQrCodes).every(isSelected => !isSelected)
          }
        >
          Download
        </Button>
      </DialogActions>
    </Container>
  );
};
