/*
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 *
 */
import { Request, Response, NextFunction } from 'express';
import { Route } from '@tupaia/server-boilerplate';
import puppeteer from 'puppeteer';
import cookie from 'cookie';

type Body = {
  pdfPageUrl: string;
};

export type PDFExportRequest = Request<
  Record<string, never>,
  { data: ReturnType<Buffer['toJSON']> },
  Body,
  Record<string, any>
>;

export class PDFExportRoute extends Route<PDFExportRequest> {
  public constructor(req: PDFExportRequest, res: Response, next: NextFunction) {
    super(req, res, next);
  }

  private extractSessionCookie = (): Record<string, string> => {
    return cookie.parse(this.req.headers.cookie || '');
  };

  private verifyBody = (body: any): Body => {
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

  private exportPDF = async (): Promise<Buffer> => {
    const cookies = this.extractSessionCookie();
    const { pdfPageUrl } = this.verifyBody(this.req.body);
    const { host: apiDomain } = this.req.headers;
    const location = new URL(pdfPageUrl);
    const finalisedCookieObjects = Object.keys(cookies).map(name => ({
      name,
      domain: apiDomain,
      url: location.origin,
      httpOnly: true,
      value: cookies[name],
    }));

    let browser;
    let result;

    try {
      browser = await puppeteer.launch();
      const page = await browser.newPage();

      await page.setCookie(...finalisedCookieObjects);
      await page.goto('http://localhost:8088/explore/', {
        timeout: 60000,
        waitUntil: 'networkidle0',
      });
      result = await page.pdf({
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

    return result;
  };

  public async buildResponse() {
    const buffer = await this.exportPDF();
    return { data: buffer.toJSON() };
  }
}
