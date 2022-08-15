import { exportToPDF } from '@tupaia/tsutils';

export const PDFExportHandler = async (req, res) => {
  const { data: buffer } = await exportToPDF(req);

  res.set({
    'Content-Type': 'application/pdf',
    'Content-Length': buffer.length,
    'Content-Disposition': 'attachment',
  });

  return res.status(200).send(buffer);
};
