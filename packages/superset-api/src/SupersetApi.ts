/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import { fetchWithTimeout } from '@tupaia/utils';
import {
  ChartDataResponseSchema,
  SecurityLoginRequestBodySchema,
  SecurityLoginResponseBodySchema,
} from './types';
import { Agent as HttpsAgent } from 'https';
import winston from 'winston';
import { HttpsProxyAgent } from 'https-proxy-agent';

const MAX_RETRIES = 1;
const MAX_FETCH_WAIT_TIME = 45 * 1000; // 45 seconds

export class SupersetApi {
  protected serverName: string;
  protected baseUrl: string;
  protected insecure: boolean;
  protected insecureAgent: HttpsAgent;
  protected accessToken: string | null = null;
  protected proxyAgent?: HttpsProxyAgent;

  public constructor(serverName: string, baseUrl: string, insecure: boolean = false) {
    if (!serverName) throw new Error('Argument serverName required');
    if (!baseUrl) throw new Error('Argument baseUrl required');
    this.serverName = serverName;
    this.baseUrl = baseUrl;
    this.insecure = insecure;
    this.insecureAgent = new HttpsAgent({ rejectUnauthorized: false });
    if (process.env.PROXY_URL) {
      winston.info(`Superset using proxy ${process.env.PROXY_URL}`);
      this.proxyAgent = new HttpsProxyAgent(process.env.PROXY_URL);
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
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
    };
    if (this.insecure) fetchConfig.agent = this.insecureAgent;
    if (this.proxyAgent) fetchConfig.agent = this.proxyAgent;
    winston.info(`Superset fetch ${this.insecure ? '(insecure) ' : ' '}${url}`);

    const result = await fetchWithTimeout(url, fetchConfig, MAX_FETCH_WAIT_TIME);

    if (result.status !== 200) {
      const bodyText = await result.text();

      if (result.status === 422 || result.status === 401) {
        winston.info(`Superset Auth error, response: ${bodyText}`);
        await this.refreshAccessToken();
        return this.fetch(url, numRetries + 1);
      }

      throw new Error(
        `Error response from Superset API. Status: ${result.status}, body: ${bodyText}`,
      );
    }

    return await result.json();
  }

  protected async refreshAccessToken() {
    const getServerVariable = (variableName: string) =>
      process.env[`${this.serverName.toUpperCase()}_${variableName}`] ||
      process.env[variableName] ||
      '';

    const username = getServerVariable('SUPERSET_API_USERNAME');
    const password = getServerVariable('SUPERSET_API_PASSWORD');

    const body: SecurityLoginRequestBodySchema = {
      username,
      password,
      provider: 'db',
      refresh: true,
    };

    const url = `${this.baseUrl}/api/v1/security/login`;
    const fetchConfig: any = {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    };
    if (this.insecure) fetchConfig.agent = this.insecureAgent;
    if (this.proxyAgent) fetchConfig.agent = this.proxyAgent;

    winston.info(`Superset refresh access token ${this.insecure ? '(insecure) ' : ' '}${url}`);
    const result = await fetchWithTimeout(url, fetchConfig, MAX_FETCH_WAIT_TIME);

    if (result.status !== 200) {
      const bodyText = await result.text();
      throw new Error(
        `Superset failed to refresh access token. Status: ${result.status}, body: ${bodyText}`,
      );
    }

    const resultBody: SecurityLoginResponseBodySchema = await result.json();

    this.accessToken = resultBody.access_token;
  }
}
