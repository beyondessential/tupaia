/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { QrCodeVisual as BaseQrCodeVisual, OFF_WHITE } from '@tupaia/ui-components';
import * as download from 'downloadjs';
import * as JSZip from 'jszip';
import { VIEW_STYLES } from '../../styles';

const StyledQrCodeContainer = styled(BaseQrCodeVisual)`
  .qrcode {
    color: ${OFF_WHITE};
  }

  .checkbox-icon {
    color: ${OFF_WHITE};
  }
`;

const QrCodeVisualComponent = ({
  onClose: originalOnClose,
  isUserLoggedIn,
  viewContent,
  isEnlarged,
}) => {
  const [error, setError] = useState(null);

  if (!isUserLoggedIn) {
    return <div style={VIEW_STYLES.downloadLink}>Please log in to enable file downloads</div>;
  }

  const downloadImages = qrCodeCanvasUrlsWithFileNames => {
    if (qrCodeCanvasUrlsWithFileNames.length < 1) {
      return;
    }

    if (qrCodeCanvasUrlsWithFileNames.length === 1) {
      const [{ name, url }] = qrCodeCanvasUrlsWithFileNames;
      download(url, `${name}.jpeg`, 'image/jpeg');
      return;
    }

    const zip = new JSZip();

    qrCodeCanvasUrlsWithFileNames.forEach(({ name, url }) => {
      const base64Data = url.replace(/^data:image\/jpeg;base64,/, '');
      zip.file(`${name}.jpeg`, base64Data, { base64: true });
    });

    zip.generateAsync({ type: 'blob' }).then(blob => {
      download(blob, 'qr-codes.zip');
    });
  };

  const onClose = () => {
    setError(null);
    originalOnClose();
  };

  const { data, ...config } = viewContent;

  return (
    <StyledQrCodeContainer
      data={data}
      config={config}
      isEnlarged={isEnlarged}
      onClose={onClose}
      downloadImages={downloadImages}
      error={error}
      isLoading={false}
    />
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
