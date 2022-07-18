/*
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 *
 */
import { Request, Response, NextFunction } from 'express';
import { Route } from '@tupaia/server-boilerplate';
import puppeteer from 'puppeteer';
import Cookies from 'cookies';

type SessionCookies = {
  sessionCookieName: string;
  sessionCookieValue: string;
};

type Body = {
  endpoint: string;
  hostname: string;
  restOfParams: Record<string, string>;
};

export type PDFExportRequest = Request<
  Record<string, never>,
  { contents: Buffer },
  Body,
  Record<string, any>
>;

export class PDFExportRoute extends Route<PDFExportRequest> {
  public constructor(req: PDFExportRequest, res: Response, next: NextFunction) {
    super(req, res, next);
    this.type = 'download';
  }

  private extractSessionCookie = (): SessionCookies => {
    const cookies = new Cookies(this.req, this.res);
    const sessionCookieName = 'sessionCookie';
    const sessionCookieValue = cookies.get(sessionCookieName);
    if (!sessionCookieValue) {
      throw new Error(`'sessionCookie' is not found`);
    }
    const sessionCookieName = sessionCookie.slice(0, sessionCookie.indexOf('='));
    const sessionCookieValue = sessionCookie.slice(sessionCookie.indexOf('=') + 1);

    return { sessionCookieName, sessionCookieValue };
  };

  private verifyBody = (body: any): Body => {
    const { endpoint, hostname, ...restOfParams } = body;
    if (!endpoint || typeof endpoint !== 'string') {
      throw new Error(`'endpoint' should be provided in request body, got: ${endpoint}`);
    }
    if (!hostname || typeof hostname !== 'string') {
      throw new Error(`'hostname' should be provided in request body, got: ${hostname}`);
    }

    return { endpoint, hostname, restOfParams };
  };

  private exportPDF = async (): Promise<Buffer> => {
    const { sessionCookieName, sessionCookieValue } = this.extractSessionCookie();

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setCookie({
      name: sessionCookieName,
      domain: body.hostname.split(':')[0], // localhost:8030 -> localhost
      httpOnly: true,
      value: sessionCookieValue,
    });
    await page.goto(url, { waitUntil: 'networkidle0' });
    const result = await page.pdf({
      format: 'a4',
      printBackground: true,
    });
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
