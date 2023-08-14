import React from 'react';
import { toDataURL } from 'qrcode';

const CANVAS_HEIGHT = 500;
const CANVAS_WIDTH = 1400;
const QR_CODE_HEIGHT = CANVAS_HEIGHT;
const QR_CODE_WIDTH = QR_CODE_HEIGHT;
const TEXT_BOX_HEIGHT = CANVAS_HEIGHT;
const TEXT_BOX_WIDTH = CANVAS_WIDTH - QR_CODE_WIDTH;

const drawQrCodeToCanvasElement = async (
  canvas: HTMLCanvasElement,
  humanReadableId: string,
  qrCodeContents: string,
) => {
  canvas.setAttribute('width', `${CANVAS_WIDTH}`);
  canvas.setAttribute('height', `${CANVAS_HEIGHT}`);

  const ctx: CanvasRenderingContext2D | null = canvas.getContext('2d');
  if (!ctx) {
    return;
  }

  // Background
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Add header text
  const textY = TEXT_BOX_HEIGHT / 2;
  const textX = TEXT_BOX_WIDTH / 2;
  ctx.fillStyle = 'black';
  ctx.font = `105px monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(humanReadableId, textX, textY);

  // Add qr code
  const qrDataUrl = await toDataURL(qrCodeContents, {
    width: CANVAS_HEIGHT,
    height: CANVAS_HEIGHT,
  });
  const img = new Image();
  const codeX = TEXT_BOX_WIDTH;
  const codeY = 0; // Make sure to avoid the QR code "quiet zone"

  img.src = qrDataUrl;
  await img.decode();
  ctx.drawImage(img, codeX, codeY);
};

export const getQrCodeDownloadUrl = async (humanReadableId: string, qrCodeContents: string) => {
  const canvas = document.createElement('canvas');
  await drawQrCodeToCanvasElement(canvas, humanReadableId, qrCodeContents);

  return canvas.toDataURL('image/jpeg', 1.0);
};

export const drawQrCode = async (
  ref: React.MutableRefObject<HTMLCanvasElement | null>,
  humanReadableId: string,
  qrCodeContents: string,
) => {
  if (!ref || !ref.current) {
    return;
  }

  const canvas = ref.current;
  await drawQrCodeToCanvasElement(canvas, humanReadableId, qrCodeContents);
};
