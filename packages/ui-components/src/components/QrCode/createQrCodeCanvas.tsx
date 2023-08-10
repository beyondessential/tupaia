import React from 'react'
import { toDataURL } from 'qrcode';

const CODE_SIZE = 320; // width/height at browser display size
const CANVAS_SIZE = 395; // width/height at browser display size
const DOWNLOAD_IMAGE_SCALE = 2; // render the canvas at double size to get a larger and clearer image download
const SCALED_CODE_SIZE = CODE_SIZE * DOWNLOAD_IMAGE_SCALE;
const SCALED_CANVAS_SIZE = CANVAS_SIZE * DOWNLOAD_IMAGE_SCALE;

export const getCanvasUrlForDownload = async (humanReadableId: string, qrCodeContents: string) => {

    const canvas = document.createElement('canvas')
    canvas.setAttribute('width', `${SCALED_CANVAS_SIZE}`);
    canvas.setAttribute('height', `${SCALED_CANVAS_SIZE}`);

    const ctx: CanvasRenderingContext2D | null = canvas.getContext('2d');
    if(!ctx) {
      return null
    }
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
    // @ts-ignore
    const qrDataUrl = await toDataURL(qrCodeContents, {
      width: SCALED_CODE_SIZE,
      height: SCALED_CODE_SIZE,
    });
    const img = new Image();
    const codeX = (SCALED_CANVAS_SIZE - SCALED_CODE_SIZE) / 2;
    const codeY = 65 * DOWNLOAD_IMAGE_SCALE; // Make sure to avoid the QR code "quiet zone"

    // @ts-ignore
    img.src = qrDataUrl;
    await img.decode();

    ctx.drawImage(img, codeX, codeY)
    const url = canvas.toDataURL('image/jpeg', 1.0);

    return url
}

export const createQrCodeCanvas = async (ref: React.MutableRefObject<HTMLCanvasElement | null>, humanReadableId: string, qrCodeContents: string) => {
    if(!ref) {
      return null
    }

    const canvas = ref.current;

    if(!canvas) {
      return null
    }
    canvas.setAttribute('width', `${SCALED_CANVAS_SIZE}`);
    canvas.setAttribute('height', `${SCALED_CANVAS_SIZE}`);

    const ctx: CanvasRenderingContext2D | null = canvas.getContext('2d');
    if(!ctx) {
      return null
    }
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
    // @ts-ignore
    const qrDataUrl = await toDataURL(qrCodeContents, {
      width: SCALED_CODE_SIZE,
      height: SCALED_CODE_SIZE,
    });
    const img = new Image();
    const codeX = (SCALED_CANVAS_SIZE - SCALED_CODE_SIZE) / 2;
    const codeY = 65 * DOWNLOAD_IMAGE_SCALE; // Make sure to avoid the QR code "quiet zone"
    img.onload = () => {
      ctx.drawImage(img, codeX, codeY)
      return canvas.toDataURL('image/jpeg', 1.0);
    };
    // @ts-ignore
    img.src = qrDataUrl;

  };

  