import cookie from 'cookie';
import puppeteer, { Browser, CookieParam } from 'puppeteer';

function isValidHostname(hostname: string): boolean {
  const { VALID_DOMAINS = 'tupaia.org' } = process.env;
  const validDomains = VALID_DOMAINS.split(' ');
  return (
    hostname.endsWith('.tupaia.org') ||
    validDomains.includes(hostname) ||
    hostname === 'localhost' ||
    hostname.endsWith('.local')
  );
}

const verifyPDFPageUrl = (pdfPageUrl: string): string => {
  if (!pdfPageUrl || typeof pdfPageUrl !== 'string') {
    throw new Error(`'pdfPageUrl' should be provided in request body, got: ${pdfPageUrl}`);
  }
  const { hostname } = new URL(pdfPageUrl);
  if (!isValidHostname(hostname)) {
    throw new Error(`'pdfPageUrl' is not valid, got: ${pdfPageUrl}`);
  }
  return pdfPageUrl;
};

const buildParams = (pdfPageUrl: string, userCookie: string, cookieDomain: string | undefined) => {
  const cookies = cookie.parse(userCookie || '');
  const verifiedPDFPageUrl = verifyPDFPageUrl(pdfPageUrl);
  const location = new URL(verifiedPDFPageUrl);
  const finalisedCookieObjects = Object.keys(cookies).map(
    name =>
      ({
        name,
        domain: cookieDomain,
        url: location.origin,
        httpOnly: true,
        value: cookies[name],
      }) as CookieParam,
  );
  return { verifiedPDFPageUrl, cookies: finalisedCookieObjects };
};

const pageNumberHTML = `
	<div
		style="
			border-block-start: 1pt solid #c1c1c1;
			color: #c1c1c1;
			font-family: Roboto, system-ui, 'Segoe UI', Helvetica Neue, Helvetica, Arial,
				sans-serif;
			font-size: 8pt;
			font-weight: 400;
			inline-size: 100%;
			margin-block-start: 15mm;
			margin-inline: 25mm;
			padding-block-start: 4.5pt;
			text-align: end;
		"
	>
		<span class="pageNumber"></span>&nbsp;of <span class="totalPages"></span>
	</div>
`;

interface DownloadPageAsPdfParams {
  /** The domain of cookie, required when setting up cookie in page */
  cookieDomain?: string;
  includePageNumber?: boolean;
  landscape?: boolean;
  /** The url to visit and download as a pdf */
  pdfPageUrl: string;
  timezone?: string;
  /** The user's cookie to bypass auth, and ensure page renders under the correct user context */
  userCookie?: string;
}

/**
 * @returns PDF buffer
 */
export const downloadPageAsPdf = async ({
  pdfPageUrl,
  userCookie = '',
  cookieDomain,
  landscape = false,
  includePageNumber = false,
  timezone,
}: DownloadPageAsPdfParams): Promise<Uint8Array> => {
  let browser: Browser | undefined;
  let buffer: Uint8Array | undefined;
  const { cookies, verifiedPDFPageUrl } = buildParams(pdfPageUrl, userCookie, cookieDomain);

  try {
    browser = await puppeteer.launch();
    const page = await browser.newPage();

    if (timezone) {
      await page.emulateTimezone(timezone);
    }

    await page.setCookie(...cookies);
    await page.goto(verifiedPDFPageUrl, { timeout: 60000, waitUntil: 'networkidle0' });

    buffer = await page.pdf({
      format: 'a4',
      printBackground: true,
      landscape,
      displayHeaderFooter: includePageNumber,
      // remove the default header so that only the page number is displayed, not a header
      headerTemplate: '<div hidden></div>',
      footerTemplate: pageNumberHTML,
      //add a margin so the page number doesn't overlap with the content, and the top margin is set for overflow content
      margin: includePageNumber ? { bottom: '15mm', top: '10mm' } : undefined,
    });
  } catch (e) {
    throw new Error(`puppeteer error: ${(e as Error).message}`);
  } finally {
    await browser?.close();
  }

  return buffer;
};
