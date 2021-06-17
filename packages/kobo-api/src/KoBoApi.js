/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import { fetchWithTimeout, stringifyQuery } from '@tupaia/utils';

const MAX_FETCH_WAIT_TIME = 15 * 1000; // 15 seconds

export class KoBoApi {
  async fetchKoBoSurveys(koboSurveyCodes, optionsInput) {
    // await validateEventOptions(optionsInput); // TODO: Write validator
    let mongoQuery = {};
    if (optionsInput.submission_time) {
      mongoQuery = { ...mongoQuery, _submission_time: { $gt: optionsInput.submission_time } };
    }
    const results = await this.fetchFromKoBo(`api/v2/assets/${koboSurveyCodes[0]}/data.json`, {
      query: JSON.stringify(mongoQuery),
    });

    // TODO: Format these results
    return results;
  }

  async fetchFromKoBo(endpoint, params) {
    const queryParams = { ...params };

    // TODO: Make base url configurable, also point it to actual kobo instance
    const url = stringifyQuery('https://kf.kobotoolbox.org', endpoint, queryParams);

    // TODO: Add a real authenticator
    const result = await fetchWithTimeout(
      url,
      // NOTE: For testing I just copy-pasted the auth token in here
      // Definitely don't push that to git though
      { headers: { Authorization: `Token <TOKEN>` } },
      MAX_FETCH_WAIT_TIME,
    );

    if (result.status !== 200) {
      const bodyText = await result.text();
      throw new Error(`Error response from KoBo API. Status: ${result.status}, body: ${bodyText}`);
    }
    return result;
  }
}
