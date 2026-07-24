import { ClientSyncManager } from '../../sync/ClientSyncManager';
import { clearDatabase } from '../../database/clearDatabase';
import { getDataVersionAction, stampDataVersion } from '../../sync/dataVersion';
import { hasOutgoingChanges } from '../../sync/hasOutgoingChanges';
import { DatatrakWebModelRegistry } from '../../types';

jest.mock('../../sync/dataVersion', () => ({
  getDataVersionAction: jest.fn(),
  stampDataVersion: jest.fn(),
}));
jest.mock('../../database/clearDatabase', () => ({
  clearDatabase: jest.fn(),
}));
jest.mock('../../sync/hasOutgoingChanges', () => ({
  hasOutgoingChanges: jest.fn(),
}));
jest.mock('@tupaia/sync', () => ({
  ...jest.requireActual('@tupaia/sync'),
  getModelsForPush: jest.fn(() => []),
}));

const mockGetDataVersionAction = getDataVersionAction as jest.MockedFunction<
  typeof getDataVersionAction
>;
const mockStampDataVersion = stampDataVersion as jest.MockedFunction<typeof stampDataVersion>;
const mockClearDatabase = clearDatabase as jest.MockedFunction<typeof clearDatabase>;
const mockHasOutgoingChanges = hasOutgoingChanges as jest.MockedFunction<typeof hasOutgoingChanges>;

const SESSION_ID = 'session-1';
const STARTED_AT_TICK = 42;

const createManager = () => {
  const addProjectForSync = jest.fn().mockResolvedValue(undefined);
  const models = {
    database: {},
    localSystemFact: { addProjectForSync },
    getModels: jest.fn(() => []),
    clearCache: jest.fn(),
  } as unknown as DatatrakWebModelRegistry;

  const manager = new ClientSyncManager(models, 'device-1');
  const pushChanges = jest.spyOn(manager, 'pushChanges').mockResolvedValue(undefined);
  const getProjectsInSync = jest
    .spyOn(manager, 'getProjectsInSync')
    .mockResolvedValue(['projectA', 'projectB']);
  jest.spyOn(manager, 'setProgress').mockImplementation(() => {});

  // ensureDataVersion is private; call it through a typed accessor.
  const ensureDataVersion = (): Promise<boolean> =>
    (manager as any).ensureDataVersion(SESSION_ID, STARTED_AT_TICK);

  return { manager, models, addProjectForSync, pushChanges, getProjectsInSync, ensureDataVersion };
};

describe('ClientSyncManager.ensureDataVersion', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockHasOutgoingChanges.mockResolvedValue(false);
  });

  it('resets: pushes before wiping, restores projects, stamps version, returns true', async () => {
    mockGetDataVersionAction.mockResolvedValue('reset');
    const { manager, addProjectForSync, pushChanges, ensureDataVersion } = createManager();

    const result = await ensureDataVersion();

    expect(result).toBe(true);
    expect(manager.dataResetDeferred).toBe(false);

    // push must happen before clearDatabase
    const pushOrder = pushChanges.mock.invocationCallOrder[0];
    const clearOrder = mockClearDatabase.mock.invocationCallOrder[0];
    expect(pushChanges).toHaveBeenCalledWith(SESSION_ID, STARTED_AT_TICK);
    expect(mockClearDatabase).toHaveBeenCalledTimes(1);
    expect(pushOrder).toBeLessThan(clearOrder);

    expect(addProjectForSync).toHaveBeenCalledWith('projectA');
    expect(addProjectForSync).toHaveBeenCalledWith('projectB');
    expect(mockStampDataVersion).toHaveBeenCalledTimes(1);
  });

  it('defers when push rejects: does not wipe, flags deferred, throws', async () => {
    mockGetDataVersionAction.mockResolvedValue('reset');
    const { manager, pushChanges, ensureDataVersion } = createManager();
    pushChanges.mockRejectedValue(new Error('offline'));

    await expect(ensureDataVersion()).rejects.toThrow(/could not be sent to the server/);

    expect(mockClearDatabase).not.toHaveBeenCalled();
    expect(manager.dataResetDeferred).toBe(true);
    expect(mockStampDataVersion).not.toHaveBeenCalled();
  });

  it('defers when residual outgoing changes remain after push: does not wipe, throws', async () => {
    mockGetDataVersionAction.mockResolvedValue('reset');
    mockHasOutgoingChanges.mockResolvedValue(true);
    const { manager, ensureDataVersion } = createManager();

    await expect(ensureDataVersion()).rejects.toThrow(/needs to update its data/);

    expect(mockClearDatabase).not.toHaveBeenCalled();
    expect(manager.dataResetDeferred).toBe(true);
  });

  it('stamps a fresh install without wiping and returns false', async () => {
    mockGetDataVersionAction.mockResolvedValue('stamp');
    const { manager, pushChanges, ensureDataVersion } = createManager();

    const result = await ensureDataVersion();

    expect(result).toBe(false);
    expect(mockStampDataVersion).toHaveBeenCalledTimes(1);
    expect(mockClearDatabase).not.toHaveBeenCalled();
    expect(pushChanges).not.toHaveBeenCalled();
    expect(manager.dataResetDeferred).toBe(false);
  });

  it('does nothing when already up to date and returns false', async () => {
    mockGetDataVersionAction.mockResolvedValue('none');
    const { manager, pushChanges, ensureDataVersion } = createManager();

    const result = await ensureDataVersion();

    expect(result).toBe(false);
    expect(mockStampDataVersion).not.toHaveBeenCalled();
    expect(mockClearDatabase).not.toHaveBeenCalled();
    expect(pushChanges).not.toHaveBeenCalled();
    expect(manager.dataResetDeferred).toBe(false);
  });
});
