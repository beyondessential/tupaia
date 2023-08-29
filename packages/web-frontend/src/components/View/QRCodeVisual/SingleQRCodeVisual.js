import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import DownloadIcon from '@material-ui/icons/GetApp';
import { IconButton, QrCodeImage, useDownloadQrCodes } from '@tupaia/ui-components';

const DownloadButton = styled(IconButton).attrs({
  color: 'default',
})`
  position: absolute;
  top: -1rem;
  right: -0.5rem;
`;

export const SingleQRCodeVisual = ({ data }) => {
  const { value, name } = data[0];
  const { downloadQrCodes } = useDownloadQrCodes(data);
  return (
    <>
      <DownloadButton title={`Download QR code for ${name}`} onClick={downloadQrCodes}>
        <DownloadIcon />
      </DownloadButton>
      <QrCodeImage humanReadableId={name} qrCodeContents={value} />
    </>
  );
};

SingleQRCodeVisual.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired,
    }),
  ).isRequired,
};
