/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { Container, DialogActions } from '@material-ui/core';
import { Data } from '../../../types';
import { CheckboxList, ListItemProps } from '../../CheckboxList';
import { useDownloadQrCodes } from '../utils';
import { Button as BaseButton } from '../../Button';

interface DownloadMultiQrCodesProps {
  data?: Data[];
  onCancelDownload: () => void;
}

const Button = styled(BaseButton)`
  text-transform: none;
`;

const ButtonWrapper = styled(DialogActions)`
  margin-top: 1rem;
`;

export const DownloadMultiQrCodes = ({
  data = [],
  onCancelDownload,
}: DownloadMultiQrCodesProps) => {
  const [selectedQrCodes, setSelectedQrCodes] = useState<Data[]>([]);
  const { isDownloading, downloadQrCodes } = useDownloadQrCodes(selectedQrCodes);
  const list = data.map(item => ({
    ...item,
    code: item.value,
  }));
  return (
    <Container>
      <CheckboxList
        list={list}
        title="Select QR Codes"
        selectedItems={selectedQrCodes}
        setSelectedItems={setSelectedQrCodes as (items: ListItemProps[]) => void}
      />
      <ButtonWrapper>
        <Button onClick={onCancelDownload} variant="outlined" color="default">
          Cancel
        </Button>
        <Button
          color="primary"
          onClick={downloadQrCodes}
          variant="contained"
          disabled={isDownloading || !selectedQrCodes.length}
        >
          Download
        </Button>
      </ButtonWrapper>
    </Container>
  );
};
