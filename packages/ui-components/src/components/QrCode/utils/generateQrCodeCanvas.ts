import { toDataURL } from 'qrcode';
import { wrapText } from './wrapText';

const CANVAS_WIDTH = 1400;
const QR_CODE_HEIGHT = 500;
const QR_CODE_WIDTH = QR_CODE_HEIGHT;
const TEXT_BOX_HEIGHT = QR_CODE_HEIGHT;
const TEXT_BOX_WIDTH = CANVAS_WIDTH - QR_CODE_WIDTH;

export const generateQrCodeCanvas = async (
  humanReadableId?: string,
  qrCodeContents?: string,
  canvas: HTMLCanvasElement = document.createElement('canvas'),
) => {
  // only make space for the text box if there is text to display
  const width = humanReadableId ? CANVAS_WIDTH : QR_CODE_WIDTH;
  canvas.setAttribute('width', `${width}`);
  canvas.setAttribute('height', `${QR_CODE_HEIGHT}`);

  const ctx: CanvasRenderingContext2D | null = canvas.getContext('2d');
  if (!ctx) {
    return null;
  }
  // Background
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, width, QR_CODE_HEIGHT);

  // Add text
  if (humanReadableId) {
    ctx.fillStyle = 'black';
    ctx.font = `105px monospace`;
    ctx.textBaseline = 'middle';
    const wrappedTextLines = wrapText(humanReadableId as string);
    if (wrappedTextLines.length === 1) {
      ctx.textAlign = 'center';
      const textY = TEXT_BOX_HEIGHT / 2;
      const textX = TEXT_BOX_WIDTH / 2;
      const [text] = wrappedTextLines;
      ctx.fillText(text, textX, textY);
    } else {
      ctx.textAlign = 'left';
      for (let i = 0; i < wrappedTextLines.length; i++) {
        const lineHeight = 115;
        const allLinesHeight = lineHeight * wrappedTextLines.length;
        const linesStartY = (TEXT_BOX_HEIGHT - allLinesHeight) / 2;
        const textY = linesStartY + lineHeight * i + lineHeight / 2;
        const textX = 60;
        ctx.fillText(wrappedTextLines[i], textX, textY);
      }
    }
  }

  // Add qr code

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const qrDataUrl = await toDataURL(qrCodeContents, {
    width: QR_CODE_WIDTH,
    height: QR_CODE_HEIGHT,
  });
  const img = new Image();
  const codeX = humanReadableId ? TEXT_BOX_WIDTH : 0;
  const codeY = 0; // Make sure to avoid the QR code "quiet zone"
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  img.src = qrDataUrl;
  await img.decode();
  ctx.drawImage(img, codeX, codeY);

  return canvas;
};
