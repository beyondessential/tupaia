import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Container, DialogActions } from '@material-ui/core';
import { useDownloadQrCodes, Button as BaseButton, CheckboxList } from '@tupaia/ui-components';

const Button = styled(BaseButton)`
  text-transform: none;
`;

const ButtonWrapper = styled(DialogActions)`
  margin-top: 1rem;
`;

export const EnlargedQRCodeVisual = ({ data, onCancelDownload }) => {
  const [selectedQrCodes, setSelectedQrCodes] = useState([]);
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
        setSelectedItems={setSelectedQrCodes}
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

EnlargedQRCodeVisual.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired,
    }),
  ).isRequired,
  onCancelDownload: PropTypes.func.isRequired,
};
