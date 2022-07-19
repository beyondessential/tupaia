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
  apiUrl: string;
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
    const { pdfPageUrl, apiUrl } = body;
    if (!pdfPageUrl || typeof pdfPageUrl !== 'string') {
      throw new Error(`'pdfPageUrl' should be provided in request body, got: ${pdfPageUrl}`);
    }
    if (!apiUrl || typeof apiUrl !== 'string') {
      throw new Error(`'apiUrl' should be provided in request body, got: ${apiUrl}`);
    }
    return { pdfPageUrl, apiUrl: apiUrl.includes('localhost') ? 'localhost' : apiUrl };
  };

  private exportPDF = async (): Promise<Buffer> => {
    const { sessionCookieName, sessionCookieValue } = this.extractSessionCookie();
    const { pdfPageUrl, apiUrl } = this.verifyBody(this.req.body);
    let browser;
    let result;

    try {
      browser = await puppeteer.launch();
      const page = await browser.newPage();
      await page.setCookie({
        name: sessionCookieName,
        domain: apiUrl,
        httpOnly: true,
        value: sessionCookieValue,
      });
      await page.goto(pdfPageUrl, { waitUntil: 'networkidle0' });
      result = await page.pdf({
        format: 'a4',
        printBackground: true,
      });
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
