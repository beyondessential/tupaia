import { downloadPageAsPDF } from '@tupaia/server-utils';

export const PDFExportHandler = async (req, res) => {
  const { pdfPageUrl, cookieDomain } = req.body;
  const { cookie } = req.headers;

  const buffer = await downloadPageAsPDF(pdfPageUrl, cookie, cookieDomain);
  res.set({
    'Content-Type': 'application/pdf',
    'Content-Length': buffer.length,
    'Content-Disposition': 'attachment',
  });

  return res.status(200).send(buffer);
};
