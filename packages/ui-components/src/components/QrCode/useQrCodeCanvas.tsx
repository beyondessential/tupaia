import React from 'react';
import { toDataURL } from 'qrcode';

const CANVAS_WIDTH = 1400;
const CANVAS_HEIGHT = 500;

export const getCanvasUrlForDownload = async (humanReadableId: string, qrCodeContents: string) => {
  const canvas = document.createElement('canvas');
  canvas.setAttribute('width', `${CANVAS_WIDTH}`);
  canvas.setAttribute('height', `${CANVAS_HEIGHT}`);

  const ctx: CanvasRenderingContext2D | null = canvas.getContext('2d');
  if (!ctx) {
    return null;
  }
  // Background
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Add header text
  const textY = 250; // Make sure to avoid the QR code "quiet zone"
  const textX = 75;
  ctx.fillStyle = 'black';
  ctx.font = `105px monospace`;
  ctx.fillText(humanReadableId, textX, textY);

  // Add qr code
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const qrDataUrl = await toDataURL(qrCodeContents, {
    width: CANVAS_HEIGHT,
    height: CANVAS_HEIGHT,
  });
  const img = new Image();
  const codeX = 900;
  const codeY = 0; // Make sure to avoid the QR code "quiet zone"

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  img.src = qrDataUrl;
  await img.decode();
  ctx.drawImage(img, codeX, codeY);

  const url = canvas.toDataURL('image/jpeg', 1.0);
  return url;
};

export const drawQrCodeCanvas = async (
  ref: React.MutableRefObject<HTMLCanvasElement | null>,
  humanReadableId: string,
  qrCodeContents: string,
  // eslint-disable-next-line consistent-return
) => {
  if (!ref) {
    return null;
  }

  const canvas = ref.current;

  if (!canvas) {
    return null;
  }
  canvas.setAttribute('width', `${CANVAS_WIDTH}`);
  canvas.setAttribute('height', `${CANVAS_HEIGHT}`);

  const ctx: CanvasRenderingContext2D | null = canvas.getContext('2d');
  if (!ctx) {
    return null;
  }
  // Background
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Add header text
  const textY = 250; // Make sure to avoid the QR code "quiet zone"
  const textX = 75;
  ctx.fillStyle = 'black';
  ctx.font = `105px monospace`;
  ctx.fillText(humanReadableId, textX, textY);

  // Add qr code
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const qrDataUrl = await toDataURL(qrCodeContents, {
    width: CANVAS_HEIGHT,
    height: CANVAS_HEIGHT,
  });
  const img = new Image();
  const codeX = 900;
  const codeY = 0; // Make sure to avoid the QR code "quiet zone"

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  img.src = qrDataUrl;
  await img.decode();
  ctx.drawImage(img, codeX, codeY);
};
