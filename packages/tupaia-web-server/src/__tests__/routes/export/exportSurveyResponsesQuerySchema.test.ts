import { exportSurveyResponsesQuerySchema } from '../../../routes/export/exportSurveyResponsesQuerySchema';

describe('exportSurveyResponsesQuerySchema', () => {
  const validQuery = {
    itemCode: 'raw_data_download',
    organisationUnitCode: 'TO',
    surveyCodes: 'SURVEY_A,SURVEY_B',
    easyReadingMode: 'true',
    startDate: '2026-01-01',
    endDate: '2026-01-31',
    timeZone: 'Pacific/Tongatapu',
  };

  it('accepts the query sent by tupaia-web, and strips unknown params', () => {
    const result = exportSurveyResponsesQuerySchema.safeParse({
      ...validQuery,
      dashboardCode: 'some_dashboard',
      projectCode: 'explore',
    });

    expect(result.success).toBe(true);
    expect(result.data).toStrictEqual(validQuery);
  });

  it('accepts a query with only itemCode, organisationUnitCode and a single survey code', () => {
    const result = exportSurveyResponsesQuerySchema.safeParse({
      itemCode: 'raw_data_download',
      organisationUnitCode: 'TO',
      surveyCodes: 'SURVEY_A',
    });

    expect(result.success).toBe(true);
  });

  const invalidQueries: [string, Record<string, unknown>, string][] = [
    ['missing itemCode', { itemCode: undefined }, 'itemCode'],
    ['repeated itemCode', { itemCode: ['a', 'b'] }, 'itemCode'],
    ['missing organisationUnitCode', { organisationUnitCode: undefined }, 'organisationUnitCode'],
    ['empty organisationUnitCode', { organisationUnitCode: '' }, 'organisationUnitCode'],
    [
      'repeated organisationUnitCode',
      { organisationUnitCode: ['TO', 'FJ'] },
      'organisationUnitCode',
    ],
    [
      'nested organisationUnitCode',
      { organisationUnitCode: { length: '2' } },
      'organisationUnitCode',
    ],
    ['nested surveyCodes', { surveyCodes: { comparator: 'like' } }, 'surveyCodes'],
    ['missing surveyCodes', { surveyCodes: undefined }, 'surveyCodes'],
    ['empty surveyCodes', { surveyCodes: '' }, 'surveyCodes'],
    ['repeated surveyCodes', { surveyCodes: ['SURVEY_A', 'SURVEY_B'] }, 'surveyCodes'],
    ['surveyCodes of only a comma', { surveyCodes: ',' }, 'surveyCodes'],
    ['surveyCodes with an empty segment', { surveyCodes: 'SURVEY_A,,SURVEY_B' }, 'surveyCodes'],
    ['surveyCodes with a leading comma', { surveyCodes: ',SURVEY_A' }, 'surveyCodes'],
    ['surveyCodes with a trailing comma', { surveyCodes: 'SURVEY_A,' }, 'surveyCodes'],
    ['non-boolean latest', { latest: 'yes' }, 'latest'],
    ['nested easyReadingMode', { easyReadingMode: { a: 'b' } }, 'easyReadingMode'],
    ['repeated startDate', { startDate: ['2026-01-01', '2026-01-02'] }, 'startDate'],
    ['repeated endDate', { endDate: ['2026-01-30', '2026-01-31'] }, 'endDate'],
    ['repeated timeZone', { timeZone: ['Pacific/Tongatapu', 'UTC'] }, 'timeZone'],
    ['nested timeZone', { timeZone: { a: 'b' } }, 'timeZone'],
    ['repeated latest', { latest: ['true', 'false'] }, 'latest'],
  ];

  it.each(invalidQueries)('rejects %s', (_description, overrides, invalidParam) => {
    const result = exportSurveyResponsesQuerySchema.safeParse({ ...validQuery, ...overrides });

    expect(result.success).toBe(false);
    expect(result.error?.issues.map(issue => issue.path[0])).toStrictEqual([invalidParam]);
  });
});
