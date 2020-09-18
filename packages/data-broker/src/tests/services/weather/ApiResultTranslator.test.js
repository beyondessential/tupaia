import { expect } from 'chai';
import { ApiResultTranslator } from '../../../services/weather/ApiResultTranslator';

describe('ApiResultTranslator', () => {
  const mockApiResponse = () => {
    return {
      MELB: {
        data: [
          {
            precip: 23.6,
            max_temp: 29.8,
            min_temp: 24,
            datetime: '2020-08-20',
          },
          {
            precip: 5,
            max_temp: 6,
            min_temp: 7,
            datetime: '2020-08-21',
          },
        ],
        sources: [],
      },
    };
  };

  it('translates event results', () => {
    const translator = new ApiResultTranslator([{ code: 'MELB', name: 'Melbourne' }], 'events', [
      'WTHR_PRECIP',
      'WTHR_MAX_TEMP',
    ]);

    const actual = translator.translate(mockApiResponse());

    expect(actual).to.deep.equal([
      {
        event: 'weather_MELB_2020-08-20',
        orgUnit: 'MELB',
        orgUnitName: 'Melbourne',
        eventDate: '2020-08-20',
        dataValues: {
          WTHR_PRECIP: 23.6,
          WTHR_MAX_TEMP: 29.8,
        },
      },
      {
        event: 'weather_MELB_2020-08-21',
        orgUnit: 'MELB',
        orgUnitName: 'Melbourne',
        eventDate: '2020-08-21',
        dataValues: {
          WTHR_PRECIP: 5,
          WTHR_MAX_TEMP: 6,
        },
      },
    ]);
  });

  it('translates analytics results', () => {
    const translator = new ApiResultTranslator([{ code: 'MELB' }], 'analytics', [
      'WTHR_PRECIP',
      'WTHR_MAX_TEMP',
    ]);

    const actual = translator.translate(mockApiResponse());

    expect(actual.results).to.deep.equal([
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
    ]);
  });
});
