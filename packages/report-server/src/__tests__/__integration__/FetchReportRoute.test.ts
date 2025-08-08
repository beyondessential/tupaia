import { TestableServer } from '@tupaia/server-boilerplate';
import { setupTestApp, REPORT, models } from './testUtilities';

describe('FetchReportRoute', () => {
  let app: TestableServer;

  beforeAll(async () => {
    app = await setupTestApp();
  });

  it('Should query the report and return the results', async () => {
    const response = await app.get(
      `fetchReport/${REPORT.code}?organisationUnitCodes=TO&hierarchy=explore`,
    );
    const report = response.body;
    expect(report.results).toEqual([
      {
        orgUnit: 'TO',
        eventDate: '2020-01-01',
        orgUnitName: 'Tonga',
      },
    ]);
  });

  it('If there is data for the specified parameters, it should save these parameters to the report in the database', async () => {
    await app.get(
      `fetchReport/${REPORT.code}?organisationUnitCodes=TO&hierarchy=explore&startDate=2020-01-01&endDate=2020-31-12`,
    );
    const report = await models.report.findOne({ code: REPORT.code });
    expect(report.latest_data_parameters).toEqual({
      hierarchy: 'explore',
      organisationUnitCodes: 'TO',
      startDate: '2020-01-01',
      endDate: '2020-31-12',
    });
  });

  it('If there is no data for the specified parameters, it should not save the parameters to the report in the database', async () => {
    await models.report.update({ code: REPORT.code }, { latest_data_parameters: {} });
    await app.get(
      `fetchReport/${REPORT.code}?organisationUnitCodes=PG&hierarchy=explore&startDate=2025-01-01&endDate=2025-31-12`,
    );
    const report = await models.report.findOne({ code: REPORT.code });
    expect(report.latest_data_parameters).toEqual({});
  });
});
