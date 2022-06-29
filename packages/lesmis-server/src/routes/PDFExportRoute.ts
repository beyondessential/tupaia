/*
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 *
 */
import { Request, Response, NextFunction } from 'express';
import { Route } from '@tupaia/server-boilerplate';
import puppeteer from 'puppeteer';
import { stringifyQuery } from '@tupaia/utils';

export type RegisterRequest = Request;
type Cookies = {
  sessionCookieName: string;
  sessionCookieValue: string;
};

type Body = {
  endpoint: string;
  hostname: string;
  restOfParams: Record<string, string>;
};

export class PDFExportRoute extends Route<RegisterRequest> {
  public constructor(req: Request, res: Response, next: NextFunction) {
    super(req, res, next);
    this.type = 'download';
  }

  private unloadSessionCookies = (): Cookies => {
    const { cookie } = this.req.headers;
    if (!cookie || Array.isArray(cookie)) {
      throw new Error('Array type or undefined "cookie" is not supported');
    }

    const sessionCookieName = cookie.slice(0, cookie.indexOf('='));
    const sessionCookieValue = cookie.slice(cookie.indexOf('=') + 1);

    return { sessionCookieName, sessionCookieValue };
  };

  private verifyBody = (body: any): Body => {
    const { endpoint, hostname, ...restOfParams } = body;
    if (!endpoint || typeof endpoint !== 'string') {
      throw new Error(`"endpoint" should be provided in request body, got: ${endpoint}`);
    }
    if (!hostname || typeof endpoint !== 'string') {
      throw new Error(`"host" should be provided in request body, got: ${endpoint}`);
    }

    return { endpoint, hostname, restOfParams };
  };

  private exportPDF = async (): Promise<Buffer> => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const { sessionCookieName, sessionCookieValue } = this.unloadSessionCookies();
    const body = this.verifyBody(this.req.body);
    await page.setCookie({
      name: sessionCookieName,
      domain: body.hostname.split(':')[0], // localhost:8030 -> localhost
      httpOnly: true,
      value: sessionCookieValue,
    });
    const protocol = body.hostname.includes('localhost') ? 'http' : 'https';
    const url = stringifyQuery(`${protocol}://${body.hostname}`, body.endpoint, body.restOfParams);
    await page.goto(url, { waitUntil: 'networkidle0' });
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
    return { contents: buffer };
  }
}
