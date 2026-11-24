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

  it('accepts surveyCodes as a repeated param', () => {
    const result = exportSurveyResponsesQuerySchema.safeParse({
      ...validQuery,
      surveyCodes: ['SURVEY_A', 'SURVEY_B'],
    });

    expect(result.success).toBe(true);
  });

  it('accepts a query with only itemCode', () => {
    const result = exportSurveyResponsesQuerySchema.safeParse({ itemCode: 'raw_data_download' });

    expect(result.success).toBe(true);
  });

  const invalidQueries: [string, Record<string, unknown>, string][] = [
    ['missing itemCode', { itemCode: undefined }, 'itemCode'],
    ['repeated itemCode', { itemCode: ['a', 'b'] }, 'itemCode'],
    ['repeated organisationUnitCode', { organisationUnitCode: ['TO', 'FJ'] }, 'organisationUnitCode'],
    ['nested organisationUnitCode', { organisationUnitCode: { length: '2' } }, 'organisationUnitCode'],
    ['nested surveyCodes', { surveyCodes: { comparator: 'like' } }, 'surveyCodes'],
    ['non-boolean latest', { latest: 'yes' }, 'latest'],
    ['nested easyReadingMode', { easyReadingMode: { a: 'b' } }, 'easyReadingMode'],
    ['repeated startDate', { startDate: ['2026-01-01', '2026-01-02'] }, 'startDate'],
  ];

  it.each(invalidQueries)('rejects %s', (_description, overrides, invalidParam) => {
    const result = exportSurveyResponsesQuerySchema.safeParse({ ...validQuery, ...overrides });

    expect(result.success).toBe(false);
    expect(result.error?.issues.map(issue => issue.path[0])).toStrictEqual([invalidParam]);
  });
});
