import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { QrCodeImage, Button, useDownloadQrCodes } from '@tupaia/ui-components';

const Container = styled.div`
  text-align: center;
`;

const ButtonContainer = styled.div`
  margin-top: 1.875rem;
`;

export const QrCodeContainer = ({ qrCodeContents, humanReadableId }) => {
  const { downloadQrCodes, isDownloading } = useDownloadQrCodes([
    {
      name: humanReadableId,
      value: qrCodeContents,
    },
  ]);
  return (
    <Container>
      <QrCodeImage qrCodeContents={qrCodeContents} humanReadableId={humanReadableId} />
      <ButtonContainer>
        <Button onClick={downloadQrCodes} disabled={isDownloading}>
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
