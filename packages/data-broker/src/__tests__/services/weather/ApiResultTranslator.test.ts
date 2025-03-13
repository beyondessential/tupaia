import { ApiResultTranslator } from '../../../services/weather/ApiResultTranslator';
import { EntityRecord } from '../../../types';

describe('ApiResultTranslator', () => {
  const entity = { code: 'MELB', name: 'Melbourne' } as EntityRecord;

  const mockApiResponse = () => {
    return {
      MELB: {
        data: [
          {
            rh: 70.2,
            precip: 23.6,
            max_temp: 29.8,
            min_temp: 24,
            datetime: '2020-08-20',
          },
          {
            rh: 83.5,
            precip: 5,
            max_temp: 6,
            min_temp: 7,
            datetime: '2020-08-21',
          },
        ],
      },
    };
  };

  it('translates event results', () => {
    const translator = new ApiResultTranslator([entity], 'events', [
      'WTHR_PRECIP',
      'WTHR_MAX_TEMP',
      'WTHR_RELATIVE_HUMIDITY',
    ]);

    const actual = translator.translate(mockApiResponse());

    expect(actual).toStrictEqual([
      {
        event: 'weather_MELB_2020-08-20',
        orgUnit: 'MELB',
        orgUnitName: 'Melbourne',
        eventDate: '2020-08-20T23:59:59',
        dataValues: {
          WTHR_PRECIP: 23.6,
          WTHR_MAX_TEMP: 29.8,
          WTHR_RELATIVE_HUMIDITY: 70.2,
        },
      },
      {
        event: 'weather_MELB_2020-08-21',
        orgUnit: 'MELB',
        orgUnitName: 'Melbourne',
        eventDate: '2020-08-21T23:59:59',
        dataValues: {
          WTHR_PRECIP: 5,
          WTHR_MAX_TEMP: 6,
          WTHR_RELATIVE_HUMIDITY: 83.5,
        },
      },
    ]);
  });

  it('translates analytics results', () => {
    const translator = new ApiResultTranslator([entity], 'analytics', [
      'WTHR_PRECIP',
      'WTHR_MAX_TEMP',
      'WTHR_RELATIVE_HUMIDITY',
    ]);

    const actual = translator.translate(mockApiResponse());

    expect(actual.results).toStrictEqual([
      {
        dataElement: 'WTHR_PRECIP',
        value: 23.6,
        organisationUnit: 'MELB',
        period: '20200820',
      },
      {
        dataElement: 'WTHR_MAX_TEMP',
        value: 29.8,
        organisationUnit: 'MELB',
        period: '20200820',
      },
      {
        dataElement: 'WTHR_RELATIVE_HUMIDITY',
        value: 70.2,
        organisationUnit: 'MELB',
        period: '20200820',
      },
      {
        dataElement: 'WTHR_PRECIP',
        value: 5,
        organisationUnit: 'MELB',
        period: '20200821',
      },
      {
        dataElement: 'WTHR_MAX_TEMP',
        value: 6,
        organisationUnit: 'MELB',
        period: '20200821',
      },
      {
        dataElement: 'WTHR_RELATIVE_HUMIDITY',
        value: 83.5,
        organisationUnit: 'MELB',
        period: '20200821',
      },
    ]);
  });

  it('handles null API result input', () => {
    const translatorEvents = new ApiResultTranslator([entity], 'events', []);

    const translatorAnalytics = new ApiResultTranslator([entity], 'analytics', []);

    const actualEvents = translatorEvents.translate({
      MELB: null,
    });

    const actualAnalytics = translatorAnalytics.translate({
      MELB: null,
    });

    expect(actualEvents).toStrictEqual([]);

    expect(actualAnalytics).toStrictEqual({
      results: [],
      metadata: {},
    });
  });
});
