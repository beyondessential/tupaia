/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Button, Container, DialogActions, Typography } from '@material-ui/core';
import {
  QrCodeVisual as BaseQrCodeVisual,
  CheckboxList,
  OFF_WHITE,
  useDownloadQrCodes,
} from '@tupaia/ui-components';
import { VIEW_STYLES } from '../../styles';

const StyledQrCodeContainer = styled(BaseQrCodeVisual)`
  .qrcode {
    color: ${OFF_WHITE};
  }

  .checkbox-icon {
    color: ${OFF_WHITE};
  }
`;

const Title = styled(Typography).attrs({
  variant: 'h3',
})`
  margin-bottom: 1rem;
  color: ${({ theme }) => theme.palette.text.primary};
  font-weight: ${({ theme }) => theme.typography.fontWeightBold};
  text-align: center;
  font-size: 1rem;
`;

const QrCodeVisualComponent = ({
  onClose: originalOnClose,
  isUserLoggedIn,
  viewContent,
  isEnlarged,
}) => {
  const [error, setError] = useState(null);
  const [selectedQrCodes, setSelectedQrCodes] = useState([]);
  const { isDownloading, downloadQrCodes } = useDownloadQrCodes(selectedQrCodes);

  if (!isUserLoggedIn) {
    return <div style={VIEW_STYLES.downloadLink}>Please log in to enable file downloads</div>;
  }

  const onClose = () => {
    setError(null);
    originalOnClose();
  };

  const { data, ...config } = viewContent;

  if (isEnlarged) {
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
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            color="primary"
            onClick={downloadQrCodes}
            variant="contained"
            disabled={isDownloading || !selectedQrCodes.length}
          >
            Download
          </Button>
        </DialogActions>
      </Container>
    );
  }

  return (
    <>
      <Title>QR Codes</Title>
      <StyledQrCodeContainer
        data={data}
        config={config}
        onClose={onClose}
        error={error}
        isLoading={false}
      />
    </>
  );
};

QrCodeVisualComponent.propTypes = {
  onClose: PropTypes.func,
  isUserLoggedIn: PropTypes.bool,
  viewContent: PropTypes.object.isRequired,
  isEnlarged: PropTypes.bool,
};

QrCodeVisualComponent.defaultProps = {
  onClose: () => {},
  isUserLoggedIn: false,
  isEnlarged: false,
};

const mapStateToProps = state => {
  const { isUserLoggedIn } = state.authentication;

  return {
    isUserLoggedIn,
  };
};

export const QrCodeVisual = connect(mapStateToProps, null)(QrCodeVisualComponent);
