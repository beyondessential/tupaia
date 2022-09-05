import { downloadPageAsPDF } from '@tupaia/tsutils';
import { convertToCDNHost } from '@tupaia/utils';

export const PDFExportHandler = async (req, res) => {
  const { pdfPageUrl } = req.body;
  const { cookie, host, via } = req.headers;
  const cookieDomain = via && via.includes('cloudfront.net') ? convertToCDNHost(host) : host;

  const buffer = await downloadPageAsPDF(pdfPageUrl, cookie, cookieDomain);
  res.set({
    'Content-Type': 'application/pdf',
    'Content-Length': buffer.length,
    'Content-Disposition': 'attachment',
  });

  return res.status(200).send(buffer);
};
