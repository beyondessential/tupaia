import { USER_SESSION_CONFIG } from '../authSession/authSession';

export const PDFExportHandler = async (req, res) => {
  const { pdfPageUrl } = req.body;
  const sessionCookieName = USER_SESSION_CONFIG.cookieName;
  const sessionCookie = req.cookies[sessionCookieName];

  const { data: buffer } = await req.ctx.services.pdfExport.getPDF(
    pdfPageUrl,
    `${sessionCookieName}=${sessionCookie}`,
  );

  res.set({
    'Content-Type': 'application/pdf',
    'Content-Length': buffer.length,
    'Content-Disposition': 'attachment',
  });

  return res.status(200).send(buffer);
};
