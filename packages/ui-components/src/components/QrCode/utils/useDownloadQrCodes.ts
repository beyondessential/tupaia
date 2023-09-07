import { useState } from 'react';
import download from 'downloadjs';
import JSZip from 'jszip';
import { generateQrCodeDataUrl } from './generateQrCodeDataUrl';
import { Data } from '../../../types';

type GeneratedQrCodes = {
  url: string;
  name?: string;
};

const generateQrCodes = async (selectedQrCodes: Data[]): Promise<GeneratedQrCodes[]> => {
  return Promise.all(
    selectedQrCodes.map(async ({ name, value }) => {
      const url = (await generateQrCodeDataUrl(name, value)) as string;
      return {
        url,
        name,
      };
    }),
  );
};

export const useDownloadQrCodes = (selectedQrCodes: Data[]) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const downloadAsZip = async (qrCodes: GeneratedQrCodes[]) => {
    const zip = new JSZip();

    qrCodes.forEach(({ name, url }) => {
      const base64Data = url.replace(/^data:image\/jpeg;base64,/, '');
      zip.file(`${name}.jpeg`, base64Data, { base64: true });
    });

    zip.generateAsync({ type: 'blob' }).then(blob => {
      download(blob, 'qr-codes.zip');
    });
  };

  const downloadSingleQrCode = async (qrCode: GeneratedQrCodes) => {
    const { name, url } = qrCode;
    download(url, `${name}.jpeg`, 'image/jpeg');
  };
  const downloadQrCodes = async () => {
    setIsDownloading(true);
    const qrCodes = await generateQrCodes(selectedQrCodes);
    if (qrCodes.length === 1) {
      downloadSingleQrCode(qrCodes[0]);
    } else downloadAsZip(qrCodes);
    setIsDownloading(false);
  };
  return {
    isDownloading,
    downloadQrCodes,
  };
};
