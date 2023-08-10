/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { toDataURL } from 'qrcode';
import { Button } from '../Button';
import download = require("downloadjs")

const Container = styled.div`
  text-align: center;
`;

const ButtonContainer = styled.div`
  margin-top: 30px;
`;

const CODE_SIZE = 320; // width/height at browser display size
const CANVAS_SIZE = 395; // width/height at browser display size
const DOWNLOAD_IMAGE_SCALE = 2; // render the canvas at double size to get a larger and clearer image download

const StyledCanvas = styled.canvas`
  width: ${CANVAS_SIZE}px;
  height: ${CANVAS_SIZE}px;
  outline: 1px solid #dedede;
`;

interface QrCodeProps {
  qrCodeContents: string;
  humanReadableId: string;
}

export const QrCode = ({ qrCodeContents, humanReadableId }: QrCodeProps) => {
  console.log('qrContents',qrCodeContents)
  console.log('humanReadable',humanReadableId)
  // Draw into a canvas so that we can download it as an image
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if(!canvas) {
      return
    }
    const dataUri = canvas.toDataURL('image/jpeg', 1.0);
    download(dataUri, `${humanReadableId}.jpeg`, 'image/jpeg');
  };

  useEffect(() => {
    const run = async () => {
      const SCALED_CODE_SIZE = CODE_SIZE * DOWNLOAD_IMAGE_SCALE;
      const SCALED_CANVAS_SIZE = CANVAS_SIZE * DOWNLOAD_IMAGE_SCALE;

      const canvas = canvasRef.current;
      if(!canvas) {
        return
      }
      canvas.setAttribute('width', `${SCALED_CANVAS_SIZE}`);
      canvas.setAttribute('height', `${SCALED_CANVAS_SIZE}`);

      const ctx = canvas.getContext('2d');
      if(!ctx) {
        return
      }
      // Background
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, SCALED_CANVAS_SIZE, SCALED_CANVAS_SIZE);

      // Add header text
      const textY = 60 * DOWNLOAD_IMAGE_SCALE; // Make sure to avoid the QR code "quiet zone"
      ctx.fillStyle = 'black';
      ctx.font = `${24 * DOWNLOAD_IMAGE_SCALE}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(humanReadableId, SCALED_CANVAS_SIZE / 2, textY);

      // Add qr code
      // @ts-ignore
      const qrDataUrl = await toDataURL(qrCodeContents, {
        width: SCALED_CODE_SIZE,
        height: SCALED_CODE_SIZE,
      });
      const img = new Image();
      const codeX = (SCALED_CANVAS_SIZE - SCALED_CODE_SIZE) / 2;
      const codeY = 65 * DOWNLOAD_IMAGE_SCALE; // Make sure to avoid the QR code "quiet zone"
      img.onload = () => ctx.drawImage(img, codeX, codeY);
      // @ts-ignore
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
