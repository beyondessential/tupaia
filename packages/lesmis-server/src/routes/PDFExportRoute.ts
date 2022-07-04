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

  private unloadSessionCookie = (): Cookies => {
    const { cookie } = this.req.headers;
    if (!cookie || typeof cookie !== 'string') {
      throw new Error(`Non string type or undefined 'cookie'`);
    }
    const sessionCookie = cookie.split('; ').find(str => str.startsWith('sessionCookie'));
    if (!sessionCookie || typeof sessionCookie !== 'string') {
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
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const { sessionCookieName, sessionCookieValue } = this.unloadSessionCookie();
    const body = this.verifyBody(this.req.body);
    await page.setCookie({
      name: sessionCookieName,
      domain: body.hostname.split(':')[0], // localhost:8030 -> localhost
      httpOnly: true,
      value: sessionCookieValue,
    });
    const protocol = body.hostname.includes('localhost') ? 'http' : 'https';
    const url = stringifyQuery(`${protocol}://${body.hostname}`, body.endpoint, body.restOfParams);
    console.log(url);
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
