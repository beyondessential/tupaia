/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import {
  ChartDataResponseSchema,
  SecurityLoginRequestBodySchema,
  SecurityLoginResponseBodySchema,
} from './types';
import winston from 'winston';
import { HttpsProxyAgent } from 'https-proxy-agent';
import needle from 'needle';
import type {
  NeedleHttpVerbs,
  BodyData as NeedleBodyData,
  NeedleOptions,
  NeedleResponse,
} from 'needle';

const MAX_RETRIES = 1;

export class SupersetApi {
  protected serverName: string;
  protected baseUrl: string;
  protected insecure: boolean;
  protected accessToken: string | null = null;
  protected proxyAgent?: HttpsProxyAgent;

  public constructor(serverName: string, baseUrl: string, insecure: boolean = false) {
    if (!serverName) throw new Error('Argument serverName required');
    if (!baseUrl) throw new Error('Argument baseUrl required');
    this.serverName = serverName;
    this.baseUrl = baseUrl;
    this.insecure = insecure;
    const proxyUrl = this.getServerVariable('SUPERSET_API_PROXY_URL');
    if (proxyUrl) {
      winston.info(`Superset using proxy`);
      this.proxyAgent = new HttpsProxyAgent(proxyUrl);
    }
  }

  public async chartData(chartId: number): Promise<ChartDataResponseSchema> {
    return this.fetch<ChartDataResponseSchema>(`${this.baseUrl}/api/v1/chart/${chartId}/data/`);
  }

  protected async fetch<T>(url: string, numRetries = 0): Promise<T> {
    if (numRetries > MAX_RETRIES) {
      throw new Error(`Superset exceeded max retries (${MAX_RETRIES}). Failed to fetch ${url}`);
    }

    if (!this.accessToken) {
      await this.refreshAccessToken();
      return this.fetch(url, numRetries + 1);
    }

    const fetchConfig: any = {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
    };
    const result = await this.apiRequest('get', url, undefined, fetchConfig);

    if (result.statusCode !== 200) {
      if (result.statusCode === 422 || result.statusCode === 401) {
        winston.info(`Superset Auth error, response: ${result.body}`);
        await this.refreshAccessToken();
        return this.fetch(url, numRetries + 1);
      }

      throw new Error(
        `Error response from Superset API. Status: ${result.statusCode}, body: ${result.body}`,
      );
    }

    return result.body as T;
  }

  protected getServerVariable(variableName: string) {
    return (
      process.env[`${this.serverName.toUpperCase()}_${variableName}`] ||
      process.env[variableName] ||
      ''
    );
  }

  protected async refreshAccessToken() {
    const username = this.getServerVariable('SUPERSET_API_USERNAME');
    const password = this.getServerVariable('SUPERSET_API_PASSWORD');

    const body: SecurityLoginRequestBodySchema = {
      username,
      password,
      provider: 'db',
      refresh: true,
    };

    const url = `${this.baseUrl}/api/v1/security/login`;
    const fetchConfig: any = {
      headers: { 'Content-Type': 'application/json' },
    };
    const result = await this.apiRequest('post', url, body, fetchConfig);

    if (result.statusCode !== 200) {
      throw new Error(
        `Superset failed to refresh access token. Status: ${result.statusCode}, body: ${result.body}`,
      );
    }

    const { access_token } = result.body as SecurityLoginResponseBodySchema;
    this.accessToken = access_token;
  }

  protected async apiRequest(
    method: NeedleHttpVerbs,
    url: string,
    reqBody: NeedleBodyData = {},
    options: NeedleOptions = {},
  ): Promise<NeedleResponse> {
    // We use the `needle` package instead of the built-in `node-fetch` package
    // because the fetch package does not let us set rejectUnauthorized=false
    // to avoid SSL issues. It only lets us set agent, but we need to be able
    // to set a proxy as the agent instead. So we have to use something that lets
    // us do this, and needle is one such package.
    const opts: any = {
      ...options,
    };
    if (this.insecure) opts.rejectUnauthorized = false;
    if (this.proxyAgent) opts.agent = this.proxyAgent;
    winston.info(`Superset request ${method} ${url}`);

    // TODO: opts.rejectUnauthorized not working, bad workaround for now
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    const x = await needle(method, url, reqBody, opts);
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = undefined;
    return x;
  }
}
