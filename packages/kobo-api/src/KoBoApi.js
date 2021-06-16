/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import { fetchWithTimeout, stringifyQuery } from '@tupaia/utils';

const MAX_FETCH_WAIT_TIME = 15 * 1000; // 15 seconds

export class KoBoApi {
  async fetchKoBoSurveys(optionsInput) {
    // await validateEventOptions(optionsInput); // TODO: Write validator
    const results = await this.fetchFromKoBo(`/api/v2/assets/${optionsInput.assetId}/data.json`, {
      query: { _submission_time: { $gt: optionsInput.submission_time } },
    });
    return results;
  }

  async fetchFromKoBo(endpoint, params) {
    const queryParams = { ...params };

    const url = stringifyQuery('https://', endpoint, queryParams);
    const result = await fetchWithTimeout(url, {}, MAX_FETCH_WAIT_TIME);

    if (result.status !== 200) {
      const bodyText = await result.text();
      throw new Error(`Error response from KoBo API. Status: ${result.status}, body: ${bodyText}`);
    }
    return result;
  }
}
