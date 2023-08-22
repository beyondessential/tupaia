/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { toDataURL } from 'qrcode';
import { Button } from '@tupaia/ui-components';
import downloadjs from 'downloadjs';

const Container = styled.div`
  text-align: center;
`;

const ButtonContainer = styled.div`
  margin-top: 30px;
`;

const CODE_SIZE = 300; // width/height at browser display size
const CANVAS_SIZE = 395; // width/height at browser display size
const DOWNLOAD_IMAGE_SCALE = 2; // render the canvas at double size to get a larger and clearer image download

const StyledCanvas = styled.canvas`
  width: ${CANVAS_SIZE}px;
  height: ${CANVAS_SIZE}px;
  outline: 1px solid #dedede;
`;

export const QrCode = ({ qrCodeContents, humanReadableId }) => {
  // Draw into a canvas so that we can download it as an image
  const canvasRef = useRef(null);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    const dataUri = canvas.toDataURL('image/jpeg', 1.0);
    downloadjs(dataUri, `${humanReadableId}.jpeg`);
  };

  useEffect(() => {
    const run = async () => {
      const SCALED_CODE_SIZE = CODE_SIZE * DOWNLOAD_IMAGE_SCALE;
      const SCALED_CANVAS_SIZE = CANVAS_SIZE * DOWNLOAD_IMAGE_SCALE;

      const canvas = canvasRef.current;
      canvas.setAttribute('width', SCALED_CANVAS_SIZE);
      canvas.setAttribute('height', SCALED_CANVAS_SIZE);

      const ctx = canvas.getContext('2d');

      // Background
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, SCALED_CANVAS_SIZE, SCALED_CANVAS_SIZE);

      // Add header text
      const textY = 60 * DOWNLOAD_IMAGE_SCALE; // Make sure to avoid the QR code "quiet zone"
      ctx.fillStyle = 'black';
      ctx.font = `${39 * DOWNLOAD_IMAGE_SCALE}px monospace`;
      ctx.textAlign = 'center';
      ctx.fillText(humanReadableId, SCALED_CANVAS_SIZE / 2, textY);

      // Add qr code
      const qrDataUrl = await toDataURL(qrCodeContents, {
        width: SCALED_CODE_SIZE,
        height: SCALED_CODE_SIZE,
      });
      const img = new Image();
      const codeX = (SCALED_CANVAS_SIZE - SCALED_CODE_SIZE) / 2;
      const codeY = 90 * DOWNLOAD_IMAGE_SCALE; // Make sure to avoid the QR code "quiet zone"
      img.onload = () => ctx.drawImage(img, codeX, codeY);
      img.src = qrDataUrl;
    };
    run();
  }, []);

  return (
    <Container>
      <StyledCanvas ref={canvasRef} />
      <ButtonContainer>
        <Button type="button" onClick={handleDownload}>
          Download
        </Button>
      </ButtonContainer>
    </Container>
  );
};

QrCode.propTypes = {
  qrCodeContents: PropTypes.string.isRequired,
  humanReadableId: PropTypes.string.isRequired,
};
