import {
  fetchWithTimeout,
  requireEnv,
  RespondingError,
  stringifyQuery,
  takesDateForm,
} from '@tupaia/utils';

const MAX_FETCH_WAIT_TIME = 15 * 1000; // 15 seconds
const MAX_FETCH_ENTRIES = 50;

export class KoBoApi {
  async fetchKoBoSubmissions(koboSurveyCode, optionsInput) {
    let mongoQuery = {};
    if (optionsInput.startSubmissionTime) {
      takesDateForm(optionsInput.startSubmissionTime);
      mongoQuery = { ...mongoQuery, _submission_time: { $gt: optionsInput.startSubmissionTime } };
    }

    let response;
    let start = 0;
    const results = [];
    try {
      do {
        response = await this.fetchFromKoBo(`api/v2/assets/${koboSurveyCode}/data.json`, {
          start,
          limit: MAX_FETCH_ENTRIES,
          query: JSON.stringify(mongoQuery),
        });
        start += MAX_FETCH_ENTRIES;
        results.push(...response.results);
      } while (response.next !== null);
    } catch (error) {
      if (error.statusCode === 404) {
        throw new RespondingError(
          `No Kobo survey exists with code: ${koboSurveyCode}`,
          error.statusCode,
          {},
          error,
        );
      } else {
        throw error;
      }
    }

    return results;
  }

  async fetchFromKoBo(endpoint, params) {
    const baseUrl = requireEnv('KOBO_URL');
    const apiKey = requireEnv('KOBO_API_KEY');

    const queryParams = { ...params };

    const url = stringifyQuery(baseUrl, endpoint, queryParams);

    const response = await fetchWithTimeout(
      url,
      { headers: { Authorization: `Token ${apiKey}` } },
      MAX_FETCH_WAIT_TIME,
    );

    if (response.status !== 200) {
      const bodyText = await response.text();
      throw new RespondingError(`Error response from KoBo API: ${bodyText}`, response.status);
    }
    return response.json();
  }
}
