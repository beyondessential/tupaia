// TODO: Can be overrided to use api-client in context, while converting web-config-server to orchestrator server
export const PDFExportHandler = async (req, res) => {
  const { pdfPageUrl } = req.body;

  const { data: buffer } = await req.ctx.services.pdfExport.getPDF(pdfPageUrl);
  res.set({
    'Content-Type': 'application/pdf',
    'Content-Length': buffer.length,
    'Content-Disposition': 'attachment',
  });

  return res.status(200).send(buffer);
};
