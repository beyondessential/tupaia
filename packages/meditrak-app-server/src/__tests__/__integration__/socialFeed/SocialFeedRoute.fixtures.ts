export const GONDOR = {
  name: 'Gondor',
  code: 'GND',
};

export const MORDOR = {
  name: 'Mordor',
  code: 'MOR',
};

export const COUNTRIES = [GONDOR, MORDOR];

// Sorted by creation_date desc
export const FEED_ITEMS = [
  {
    country: MORDOR.code,
    type: 'SurveyResponse',
    creation_date: new Date('2020-01-04').toJSON(),
  },
  {
    country: GONDOR.code,
    type: 'SurveyResponse',
    creation_date: new Date('2020-01-03').toJSON(),
  },
  {
    country: GONDOR.code,
    type: 'markdown',
    creation_date: new Date('2020-01-02').toJSON(),
  },
  {
    country: null,
    type: 'SurveyResponse',
    creation_date: new Date('2020-01-01').toJSON(),
  },
];
