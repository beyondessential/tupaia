import { composeDataByDataClass } from '../../../../apiV1/dataBuilders/helpers/composeDataByDataClass';

describe('composeDataByDataClass', () => {
  it('composeDataByDataClass', async () =>
    expect(
      composeDataByDataClass(
        [
          {
            name: 'FEMALE_10_TO_19',
            value: 75,
          },
          {
            name: 'FEMALE_20_TO_29',
            value: 497,
          },
          {
            name: 'MALE_10_TO_19',
            value: 80,
          },
          {
            name: 'MALE_20_TO_29',
            value: 508,
          },
        ],
        {
          Males: {
            '10-19 years': 'MALE_10_TO_19',
            '20-29 years': 'MALE_20_TO_29',
          },
          Females: {
            '10-19 years': 'FEMALE_10_TO_19',
            '20-29 years': 'FEMALE_20_TO_29',
          },
        },
      ),
    ).toStrictEqual([
      { name: '10-19 years', Males: 80, Females: 75 },
      { name: '20-29 years', Males: 508, Females: 497 },
    ]));
});
