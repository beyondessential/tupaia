import { toDataURL } from 'qrcode';

const CANVAS_WIDTH = 1400;
const QR_CODE_HEIGHT = 500;
const QR_CODE_WIDTH = QR_CODE_HEIGHT;
const TEXT_BOX_HEIGHT = QR_CODE_HEIGHT;
const TEXT_BOX_WIDTH = CANVAS_WIDTH - QR_CODE_WIDTH;

export const generateQrCodeCanvas = async (
  humanReadableId: string,
  qrCodeContents: string,
  canvas: HTMLCanvasElement = document.createElement('canvas'),
) => {
  const width = CANVAS_WIDTH;
  canvas.setAttribute('width', `${width}`);
  canvas.setAttribute('height', `${QR_CODE_HEIGHT}`);

  const ctx: CanvasRenderingContext2D | null = canvas.getContext('2d');
  if (!ctx) {
    return null;
  }
  // Background
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, width, QR_CODE_HEIGHT);

  // Add header text
  const textY = TEXT_BOX_HEIGHT / 2;
  const textX = TEXT_BOX_WIDTH / 2;
  ctx.fillStyle = 'black';
  ctx.font = `105px monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(humanReadableId, textX, textY);

  // Add qr code

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const qrDataUrl = await toDataURL(qrCodeContents, {
    width: QR_CODE_WIDTH,
    height: QR_CODE_HEIGHT,
  });
  const img = new Image();
  const codeX = TEXT_BOX_WIDTH;
  const codeY = 0; // Make sure to avoid the QR code "quiet zone"
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  img.src = qrDataUrl;
  await img.decode();
  ctx.drawImage(img, codeX, codeY);

  return canvas;
};
