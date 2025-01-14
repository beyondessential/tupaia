export const PROGRAM = { code: 'PROGRAM_CODE', id: 'program_dhisId' };

export const DATA_ELEMENTS = [
  { id: 'femalePopulation_dhisId', code: 'FEMALE_POPULATION' },
  { id: 'malePopulation_dhisId', code: 'MALE_POPULATION' },
];

export const ORGANISATION_UNITS = [
  { id: 'to_dhisId', code: 'TO' },
  { id: 'pg_dhisId', code: 'PG' },
];

/**
 * Represents the query at its various stages during the method's execution.
 * Useful for stubs and assertions
 */
export const QUERY = {
  // The query as passed in by the method's consumers
  originalInput: {
    programCode: PROGRAM.code,
    dataElementCodes: ['FEMALE_POPULATION', 'MALE_POPULATION'],
    organisationUnitCodes: ['TO', 'PG'],
    period: '20200101',
  },
  // Data element ids have been replaced by their codes by a helper method
  // (not part of the unit test)
  idsReplacedWithCodes: {
    dataElementIds: ['femalePopulation_dhisId', 'malePopulation_dhisId'],
    organisationUnitIds: ['to_dhisId', 'pg_dhisId'],
    period: '20200101',
  },
  // The final format that should be passed in to the fetch method (part of the unit test)
  fetch: {
    dimension: [
      'femalePopulation_dhisId',
      'malePopulation_dhisId',
      'ou:to_dhisId;pg_dhisId',
      'pe:20200101',
    ],
  },
};

export const ANALYTICS_RESULTS = {
  raw: {
    headers: [
      { name: 'ou', column: 'Organisation unit' },
      { name: 'femalePopulation_dhisId', column: 'Female population' },
      { name: 'malePopulation_dhisId', column: 'Male population' },
    ],
    metaData: {
      items: {
        femalePopulation_dhisId: { name: 'Female population' },
        malePopulation_dhisId: { name: 'Male population' },
        ou: { name: 'Organisation unit' },
      },
      dimensions: {
        femalePopulation_dhisId: [],
        malePopulation_dhisId: [],
        ou: ['to_dhisId', 'pg_dhisId'],
      },
    },
    rows: [
      ['to_dhisId', '10.0', '15.0'],
      ['pg_dhisId', '20.0', '25.0'],
    ],
  },
  translatedDataElementIds: {
    headers: [
      { name: 'ou', column: 'Organisation unit' },
      { name: 'FEMALE_POPULATION', column: 'Female population' },
      { name: 'MALE_POPULATION', column: 'Male population' },
    ],
    metaData: {
      items: {
        FEMALE_POPULATION: { name: 'Female population' },
        MALE_POPULATION: { name: 'Male population' },
        ou: { name: 'Organisation unit' },
      },
      dimensions: {
        FEMALE_POPULATION: [],
        MALE_POPULATION: [],
        ou: ['to_dhisId', 'pg_dhisId'],
      },
    },
    rows: [
      ['to_dhisId', '10.0', '15.0'],
      ['pg_dhisId', '20.0', '25.0'],
    ],
  },
};
