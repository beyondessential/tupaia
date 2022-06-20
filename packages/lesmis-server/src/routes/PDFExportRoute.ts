/*
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 *
 */
import { Request, Response, NextFunction } from 'express';
import { Route } from '@tupaia/server-boilerplate';
import puppeteer from 'puppeteer';

export type RegisterRequest = Request;

export class PDFExportRoute extends Route<RegisterRequest> {
  public constructor(req: Request, res: Response, next: NextFunction) {
    super(req, res, next);
    this.type = 'download';
  }

  private exportPDF = async (): Promise<Buffer> => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://www.google.com');
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
    return { contents: buffer, filePath: 'download.pdf' };
  }
}
