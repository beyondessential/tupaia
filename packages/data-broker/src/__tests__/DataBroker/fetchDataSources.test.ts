import {
  fetchDataElements,
  fetchDataGroups,
  fetchSyncGroups,
} from '../../DataBroker/fetchDataSources';
import { DATA_ELEMENTS, DATA_GROUPS, SYNC_GROUPS } from './DataBroker.fixtures';
import { createModelsStub } from './DataBroker.stubs';

const models = createModelsStub();

describe('fetchDataElements', () => {
  it('empty input', async () => {
    await expect(fetchDataElements(models, [])).toBeRejectedWith(
      'Please provide at least one existing data element code',
    );
  });

  it('no data element found', async () => {
    await expect(fetchDataElements(models, ['NON_EXISTING1', 'NON_EXISTING2'])).toBeRejectedWith(
      'None of the following data elements exist: NON_EXISTING1,NON_EXISTING2',
    );
  });

  it('returns all found data elements', async () => {
    const results = await fetchDataElements(models, ['DHIS_01', 'DHIS_02', 'NON_EXISTING']);
    expect(results).toStrictEqual([DATA_ELEMENTS.DHIS_01, DATA_ELEMENTS.DHIS_02]);
  });
});

describe('fetchDataGroups', () => {
  it('empty input', async () => {
    await expect(fetchDataGroups(models, [])).toBeRejectedWith(
      'Please provide at least one existing data group code',
    );
  });

  it('no data group found', async () => {
    await expect(fetchDataGroups(models, ['NON_EXISTING1', 'NON_EXISTING2'])).toBeRejectedWith(
      'None of the following data groups exist: NON_EXISTING1,NON_EXISTING2',
    );
  });

  it('returns all found data groups', async () => {
    const results = await fetchDataGroups(models, [
      'DHIS_PROGRAM_01',
      'DHIS_PROGRAM_02',
      'NON_EXISTING',
    ]);
    expect(results).toStrictEqual([DATA_GROUPS.DHIS_PROGRAM_01, DATA_GROUPS.DHIS_PROGRAM_02]);
  });
});

describe('fetchSyncGroups', () => {
  it('empty input', async () => {
    await expect(fetchSyncGroups(models, [])).toBeRejectedWith(
      'Please provide at least one existing sync group code',
    );
  });

  it('no sync group found', async () => {
    await expect(fetchSyncGroups(models, ['NON_EXISTING1', 'NON_EXISTING2'])).toBeRejectedWith(
      'None of the following sync groups exist: NON_EXISTING1,NON_EXISTING2',
    );
  });

  it('returns all found sync groups', async () => {
    const results = await fetchSyncGroups(models, [
      'DHIS_SYNC_GROUP_01',
      'DHIS_SYNC_GROUP_02',
      'NON_EXISTING',
    ]);
    expect(results).toStrictEqual([SYNC_GROUPS.DHIS_SYNC_GROUP_01, SYNC_GROUPS.DHIS_SYNC_GROUP_02]);
  });
});
