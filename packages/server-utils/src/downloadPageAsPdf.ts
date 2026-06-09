import * as cookie from 'cookie';
import puppeteer, { Browser, CookieParam } from 'puppeteer';

import { getEnvVarOrDefault } from '@tupaia/utils';

function isValidHostname(hostname: string): boolean {
  const validDomains = (getEnvVarOrDefault('VALID_DOMAINS', 'tupaia.org') as string)
    .split(' ')
    .map(domain => domain.trim())
    .filter(Boolean);

  return (
    hostname.endsWith('.tupaia.org') ||
    validDomains.includes(hostname) ||
    hostname === 'localhost' ||
    hostname.endsWith('.local')
  );
}

const verifyPageUrl = (pageUrl: string): string => {
  if (!pageUrl || typeof pageUrl !== 'string') {
    throw new Error(`'pageUrl' should be provided in request body, got: ${pageUrl}`);
  }
  const { hostname } = new URL(pageUrl);
  if (!isValidHostname(hostname)) {
    throw new Error(`'pageUrl' is not valid, got: ${pageUrl}`);
  }
  return pageUrl;
};

const buildParams = (pageUrl: string, userCookie: string, cookieDomain: string | undefined) => {
  const cookies = cookie.parse(userCookie || '');
  const verifiedPageUrl = verifyPageUrl(pageUrl);
  const location = new URL(verifiedPageUrl);
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
  return { verifiedPageUrl, cookies: finalisedCookieObjects };
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
  pageUrl: string;
  timezone?: string;
  /** The user's cookie to bypass auth, and ensure page renders under the correct user context */
  userCookie?: string;
}

interface DownloadPageAsImageParams {
  /** The domain of cookie, required when setting up cookie in page */
  cookieDomain?: string;
  /** The url to visit and download as an image */
  pageUrl: string;
  /** The user's cookie to bypass auth, and ensure page renders under the correct user context */
  userCookie?: string;
}

/**
 * @returns PNG buffer
 */
export const downloadPageAsImage = async ({
  pageUrl,
  userCookie = '',
  cookieDomain,
}: DownloadPageAsImageParams): Promise<Uint8Array> => {
  let browser: Browser | undefined;
  let buffer: Uint8Array | undefined;
  const { cookies, verifiedPageUrl } = buildParams(pageUrl, userCookie, cookieDomain);

  try {
    browser = await puppeteer.launch();
    const page = await browser.newPage();
    // A4 landscape dimensions at 96 DPI (297mm × 210mm)
    await page.setViewport({ width: 1123, height: 794 });
    if (cookies.length > 0) {
      await page.setCookie(...cookies);
    }
    await page.goto(verifiedPageUrl, { timeout: 60000, waitUntil: 'networkidle0' });
    buffer = await page.screenshot({ type: 'png' });
  } catch (e) {
    throw new Error(`puppeteer error: ${(e as Error).message}`);
  } finally {
    await browser?.close();
  }

  return buffer as Uint8Array;
};

/**
 * @returns PDF buffer
 */
export const downloadPageAsPdf = async ({
  pageUrl,
  userCookie = '',
  cookieDomain,
  landscape = false,
  includePageNumber = false,
  timezone,
}: DownloadPageAsPdfParams): Promise<Uint8Array> => {
  let browser: Browser | undefined;
  let buffer: Uint8Array | undefined;
  const { cookies, verifiedPageUrl } = buildParams(pageUrl, userCookie, cookieDomain);

  try {
    browser = await puppeteer.launch();
    const page = await browser.newPage();

    if (timezone) {
      await page.emulateTimezone(timezone);
    }

    if (cookies.length > 0) {
      await page.setCookie(...cookies);
    }
    await page.goto(verifiedPageUrl, { timeout: 60000, waitUntil: 'networkidle0' });

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
