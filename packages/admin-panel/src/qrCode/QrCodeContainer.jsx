/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import * as download from 'downloadjs';
import { QrCodeImage, Button, getCanvasUrlForDownload } from '@tupaia/ui-components';

const Container = styled.div`
  text-align: center;
`;

const ButtonContainer = styled.div`
  margin-top: 1.875rem;
`;

export const QrCodeContainer = ({ qrCodeContents, humanReadableId }) => {
  const handleDownload = async () => {
    const dataUri = await getCanvasUrlForDownload(humanReadableId, qrCodeContents);

    if (!dataUri) {
      return;
    }
    download(dataUri, `${humanReadableId}.jpeg`, 'image/jpeg');
  };

  return (
    <Container>
      <QrCodeImage qrCodeContents={qrCodeContents} humanReadableId={humanReadableId} />
      <ButtonContainer>
        <Button type="button" onClick={handleDownload}>
          Download
        </Button>
      </ButtonContainer>
    </Container>
  );
};

QrCodeContainer.propTypes = {
  qrCodeContents: PropTypes.string.isRequired,
  humanReadableId: PropTypes.string.isRequired,
};
