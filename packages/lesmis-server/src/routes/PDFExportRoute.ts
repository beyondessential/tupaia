/*
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 *
 */
import { Request, Response, NextFunction } from 'express';
import { Route } from '@tupaia/server-boilerplate';
import puppeteer from 'puppeteer';

export type RegisterRequest = Request;
type Cookies = {
  host: string;
  sessionCookieName: string;
  sessionCookieValue: string;
};
export class PDFExportRoute extends Route<RegisterRequest> {
  public constructor(req: Request, res: Response, next: NextFunction) {
    super(req, res, next);
    this.type = 'download';
  }

  private unloadSessionCookies = (): Cookies => {
    const { host, cookie } = this.req.headers;
    if (!cookie || Array.isArray(cookie)) {
      throw new Error('Array type or undefined "cookie" is not supported');
    }
    if (!host) {
      throw new Error(`"host" in headers should be defined`);
    }
    const sessionCookieName = cookie.slice(0, cookie.indexOf('='));
    const sessionCookieValue = cookie.slice(cookie.indexOf('=') + 1);
    return { host, sessionCookieName, sessionCookieValue };
  };

  private exportPDF = async (): Promise<Buffer> => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const { host, sessionCookieName, sessionCookieValue } = this.unloadSessionCookies();
    await page.setCookie({
      name: sessionCookieName,
      domain: host,
      httpOnly: true,
      value: sessionCookieValue,
    });
    await page.goto('http://localhost:3003/en/LA/dashboard', { waitUntil: 'networkidle0' });
    const result = await page.pdf({
      format: 'a4',
      printBackground: true,
    });
    await page.setCookie({ name: sessionCookieName, value: '' });
    await browser.close();
    return result;
  };

  public async buildResponse() {
    const buffer = await this.exportPDF();
    this.res.set({
      'Content-Type': 'application/pdf',
      'Content-Length': buffer.length,
      'Content-Disposition': 'attachment',
    });
    return { contents: buffer, filePath: 'download.pdf' };
  }
}
