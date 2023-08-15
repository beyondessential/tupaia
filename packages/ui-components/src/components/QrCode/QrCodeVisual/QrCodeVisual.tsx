/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { Button, DialogActions, Container } from '@material-ui/core';
import { ViewConfig } from '@tupaia/types';
import { NoData } from '../../NoData';
import { Data } from '../../../types';
import { SingleQrCode } from './SingleQrCode';
import { MultiQrCodes } from './MultiQrCode';

const Wrapper = styled(Container).attrs({
  maxWidth: 'sm',
})`
  padding-bottom: 1rem;
`;

const Error = styled.div`
  color: ${props => props.theme.palette.error.main};
  margin-top: 0.625rem;
  text-align: center;
`;

interface DownloadQrCodeVisualProps {
  config?: ViewConfig;
  data?: Data[];
  isLoading?: boolean;
  onClose: () => void;
  className?: string;
  error?: string;
}

export const QrCodeVisual = ({
  config,
  data: options = [],
  isLoading,
  onClose,
  className,
  error,
}: DownloadQrCodeVisualProps) => {
  if (!isLoading && options.length === 0) {
    return (
      <Wrapper className={className}>
        <NoData viewContent={config} />
      </Wrapper>
    );
  }

  if (error) {
    return (
      <Wrapper className={className}>
        <Error>{error}</Error>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
        </DialogActions>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      {options.length > 1 ? <MultiQrCodes data={options} /> : <SingleQrCode data={options} />}
    </Wrapper>
  );
};
