import winston from 'winston';
import { HttpsProxyAgent } from 'https-proxy-agent';
import fetch, { RequestInit, Response } from 'node-fetch';
import {
  ChartDataResponseSchema,
  SecurityLoginRequestBodySchema,
  SecurityLoginResponseBodySchema,
} from './types';

const MAX_RETRIES = 1;

export class SupersetApi {
  protected serverName: string;
  protected baseUrl: string;
  protected accessToken: string | null = null;
  protected proxyAgent?: HttpsProxyAgent;

  public constructor(serverName: string, baseUrl: string) {
    if (!serverName) throw new Error('Argument serverName required');
    if (!baseUrl) throw new Error('Argument baseUrl required');
    this.serverName = serverName;
    this.baseUrl = baseUrl;
    const proxyUrl = this.getServerVariable('SUPERSET_API_PROXY_URL');
    if (proxyUrl) {
      winston.info(`Superset using proxy`);
      this.proxyAgent = new HttpsProxyAgent(proxyUrl);
    }
  }

  public async chartData(chartId: string): Promise<ChartDataResponseSchema> {
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

    const options: RequestInit = {
      method: 'get',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
    };
    const result = await this.apiRequest(url, options);

    if (result.status !== 200) {
      if (result.status === 422 || result.status === 401) {
        winston.info(`Superset Auth error, response: ${await result.text()}`);
        await this.refreshAccessToken();
        return this.fetch(url, numRetries + 1);
      }

      throw new Error(
        `Error response from Superset API. Status: ${result.status}, body: ${await result.text()}`,
      );
    }

    try {
      const json = await result.json();
      return json as T;
    } catch (e) {
      throw new Error(`Invalid response ${e}`);
    }
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
    const options: RequestInit = {
      method: 'post',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    };
    const result = await this.apiRequest(url, options);

    if (result.status !== 200) {
      throw new Error(
        `Superset failed to refresh access token. Status: ${
          result.status
        }, body: ${await result.text()}`,
      );
    }

    try {
      const json = await result.json();
      const { access_token } = json as SecurityLoginResponseBodySchema;
      this.accessToken = access_token;
    } catch (e) {
      throw new Error(`Invalid response ${e}`);
    }
  }

  protected async apiRequest(url: string, options: RequestInit = {}): Promise<Response> {
    // Band-aid cast: HttpsProxyAgent extends Agent, not sure what discrepancy TS is picking up
    if (this.proxyAgent) options.agent = this.proxyAgent as unknown as RequestInit['agent'];
    winston.info(`Superset request ${options.method} ${url}`);
    return fetch(url, options);
  }
}
