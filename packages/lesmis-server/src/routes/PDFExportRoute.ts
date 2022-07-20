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
  pdfPageUrl: string;
  apiDomain: string;
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
    return { sessionCookieName, sessionCookieValue };
  };

  private verifyBody = (body: any): Body => {
    const { pdfPageUrl, apiDomain } = body;
    if (!pdfPageUrl || typeof pdfPageUrl !== 'string') {
      throw new Error(`'pdfPageUrl' should be provided in request body, got: ${pdfPageUrl}`);
    }
    if (!apiDomain || typeof apiDomain !== 'string') {
      throw new Error(`'apiDomain' should be provided in request body, got: ${apiDomain}`);
    }
    return { pdfPageUrl, apiDomain };
  };

  private exportPDF = async (): Promise<Buffer> => {
    const { sessionCookieName, sessionCookieValue } = this.extractSessionCookie();
    const { pdfPageUrl, apiDomain } = this.verifyBody(this.req.body);
    const location = new URL(pdfPageUrl);

    let browser;
    let result;

    try {
      browser = await puppeteer.launch();
      const page = await browser.newPage();
      await page.setCookie({
        name: sessionCookieName,
        domain: apiDomain,
        url: location.origin,
        httpOnly: true,
        value: sessionCookieValue,
      });
      await page.goto(pdfPageUrl, { timeout: 60000, waitUntil: 'networkidle0' });
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
    this.res.set({
      'Content-Type': 'application/pdf',
      'Content-Length': buffer.length,
      'Content-Disposition': 'attachment',
    });
    return { contents: buffer };
  }
}
