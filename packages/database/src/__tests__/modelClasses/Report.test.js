import { upsertDummyRecord, getTestModels, findOrCreateDummyRecord } from '../../server/testUtilities';

describe('ReportModel', () => {
  const models = getTestModels();

  let publicPermissionGroup;
  let report;

  beforeAll(async () => {
    publicPermissionGroup = await findOrCreateDummyRecord(models.permissionGroup, {
      name: 'Public',
    });
    report = await upsertDummyRecord(models.report, {
      code: 'BCD',
      config: {},
      permission_group_id: publicPermissionGroup.id,
      latest_data_parameters: {},
    });
  });

  describe('setLatestDataParameters()', () => {
    it('should set the latest data parameters', async () => {
      const parameters = {
        hierarchy: 'explore',
        organisationUnitCodes: ['TO'],
        startDate: '2020-01-01',
        endDate: '2020-31-12',
      };
      await report.setLatestDataParameters(parameters);
      const { latest_data_parameters: latestDataParameters } = await models.report.findById(
        report.id,
      );
      expect(latestDataParameters).toStrictEqual(parameters);
    });
  });
});
