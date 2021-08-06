/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import { fetchWithTimeout, stringifyQuery, takesDateForm } from '@tupaia/utils';

const MAX_FETCH_WAIT_TIME = 15 * 1000; // 15 seconds
const MAX_FETCH_ENTRIES = 50;

export class KoBoApi {
  constructor() {
    this.baseUrl = process.env.KOBO_URL;
    this.apiKey = process.env.KOBO_API_KEY;
  }

  async fetchKoBoSubmissions(koboSurveyCode, optionsInput) {
    let mongoQuery = {};
    if (optionsInput.startSubmissionTime) {
      takesDateForm(optionsInput.startSubmissionTime);
      mongoQuery = { ...mongoQuery, _submission_time: { $gt: optionsInput.startSubmissionTime } };
    }

    let response;
    let start = 0;
    const results = [];
    do {
      response = await this.fetchFromKoBo(`api/v2/assets/${koboSurveyCode}/data.json`, {
        start,
        limit: MAX_FETCH_ENTRIES,
        query: JSON.stringify(mongoQuery),
      });
      start += MAX_FETCH_ENTRIES;
      results.push(...response.results);
    } while (response.next !== null);

    return results;
  }

  async fetchFromKoBo(endpoint, params) {
    const queryParams = { ...params };

    const url = stringifyQuery(this.baseUrl, endpoint, queryParams);

    const response = await fetchWithTimeout(
      url,
      { headers: { Authorization: `Token ${this.apiKey}` } },
      MAX_FETCH_WAIT_TIME,
    );

    if (response.status !== 200) {
      const bodyText = await response.text();
      throw new Error(
        `Error response from KoBo API. Status: ${response.status}, body: ${bodyText}`,
      );
    }
    return response.json();
  }
}
