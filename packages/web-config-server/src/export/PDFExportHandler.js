import { downloadPageAsPdf } from '@tupaia/tsutils';

export const PDFExportHandler = async (req, res) => {
  const { pdfPageUrl } = req.body;
  const { cookie } = req.headers;
  const { host: cookieDomain } = req.headers;

  const buffer = await downloadPageAsPdf(pdfPageUrl, cookie, cookieDomain);
  res.set({
    'Content-Type': 'application/pdf',
    'Content-Length': buffer.length,
    'Content-Disposition': 'attachment',
  });

  return res.status(200).send(buffer);
};
