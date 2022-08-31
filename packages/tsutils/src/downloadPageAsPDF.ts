import cookie from 'cookie';
import puppeteer from 'puppeteer';

const verifyPDFPageUrl = (pdfPageUrl: string): string => {
  const lesmisValidDomains = ['lesmis.la', 'www.lesmis.la'];
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
  return pdfPageUrl;
};

const buildParams = (pdfPageUrl: string, userCookie: string, cookieDomain: string | undefined) => {
  const cookies = cookie.parse(userCookie || '');
  const verifiedPDFPageUrl = verifyPDFPageUrl(pdfPageUrl);
  const location = new URL(verifiedPDFPageUrl);
  const finalisedCookieObjects = Object.keys(cookies).map(name => ({
    name,
    domain: cookieDomain,
    url: location.origin,
    httpOnly: true,
    value: cookies[name],
  }));
  return { verifiedPDFPageUrl, cookies: finalisedCookieObjects };
};

/**
 * @param pdfPageUrl the url to visit and download as a pdf
 * @param userCookie the user's cookie to bypass auth, and ensure page renders under the correct user context
 * @param cookieDomain the domain of cookie, required when setting up cookie in page
 * @returns pdf buffer
 */
export const downloadPageAsPDF = async (
  pdfPageUrl: string,
  userCookie = '',
  cookieDomain: string | undefined,
) => {
  let browser;
  let buffer;
  const { cookies, verifiedPDFPageUrl } = buildParams(pdfPageUrl, userCookie, cookieDomain);

  try {
    browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setCookie(...cookies);
    await page.goto(verifiedPDFPageUrl, { timeout: 60000, waitUntil: 'networkidle0' });
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

  return buffer;
};
