import cookie from 'cookie';
import puppeteer from 'puppeteer';

type RequestBody = {
  pdfPageUrl: string;
};

const verifyBody = (body: any): RequestBody => {
  const lesmisValidDomains = ['lesmis.la', 'www.lesmis.la'];
  const { pdfPageUrl } = body;
  if (!pdfPageUrl || typeof pdfPageUrl !== 'string') {
    throw new Error(`'pdfPageUrl' should be provided in request body, got: ${pdfPageUrl}`);
  }
  const location = new URL(pdfPageUrl);
  if (
    !location.hostname.endsWith('.tupaia.org') &&
    !lesmisValidDomains.includes(location.hostname) &&
    !location.hostname.endsWith('localhost')
  ) {
    throw new Error(`'pdfPageUrl' is not valid, got: ${pdfPageUrl}`);
  }
  return { pdfPageUrl };
};

const buildParams = (req: any) => {
  const cookies = cookie.parse(req.headers.cookie || '');
  const { pdfPageUrl } = verifyBody(req.body);
  const { host: apiDomain } = req.headers;
  const location = new URL(pdfPageUrl);
  const finalisedCookieObjects = Object.keys(cookies).map(name => ({
    name,
    domain: apiDomain,
    url: location.origin,
    httpOnly: true,
    value: cookies[name],
  }));
  return { pdfPageUrl, cookies: finalisedCookieObjects };
};

export const exportToPDF = async (req: any) => {
  let browser;
  let buffer;
  const { cookies, pdfPageUrl } = buildParams(req);

  try {
    browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setCookie(...cookies);
    await page.goto(pdfPageUrl, { timeout: 60000, waitUntil: 'networkidle0' });
    buffer = await page.pdf({
      format: 'a4',
      printBackground: true,
    });
  } catch (e) {
    throw new Error(`puppeteer error: ${(e as Error).message}`);
  } finally {
    if (browser) {
      await browser.close();
    }
  }

  return { data: buffer };
};
