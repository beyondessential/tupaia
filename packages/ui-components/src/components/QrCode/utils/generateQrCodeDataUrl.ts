import { generateQrCodeCanvas } from './generateQrCodeCanvas';

export const generateQrCodeDataUrl = async (
  humanReadableId: string,
  qrCodeContents: string,
  canvasEl: HTMLCanvasElement = document.createElement('canvas'),
) => {
  const canvas = await generateQrCodeCanvas(humanReadableId, qrCodeContents, canvasEl);
  if (!canvas) return null;
  const url = canvas.toDataURL('image/jpeg', 1.0);
  return url;
};
