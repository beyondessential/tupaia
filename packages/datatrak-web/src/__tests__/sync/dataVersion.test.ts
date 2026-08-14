import { SyncFact } from '@tupaia/constants';

import { REQUIRED_DATA_VERSION } from '../../constants';
import {
  getDataVersionAction,
  getStoredDataVersion,
  stampDataVersion,
} from '../../sync/dataVersion';
import { getSyncTick } from '../../sync/getSyncTick';
import { DatatrakWebModelRegistry } from '../../types';

jest.mock('../../sync/getSyncTick', () => ({
  getSyncTick: jest.fn(),
}));

const mockGetSyncTick = getSyncTick as jest.MockedFunction<typeof getSyncTick>;

const createModels = (initialFacts: Record<string, string> = {}) => {
  const store = new Map<string, string>(Object.entries(initialFacts));
  const localSystemFact = {
    get: jest.fn(async (key: string) => store.get(key) ?? null),
    set: jest.fn(async (key: string, value: string) => {
      store.set(key, value);
    }),
  };
  return { store, models: { localSystemFact } as unknown as DatatrakWebModelRegistry };
};

describe('dataVersion', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getStoredDataVersion', () => {
    it('defaults to 0 when the fact is missing', async () => {
      const { models } = createModels();
      expect(await getStoredDataVersion(models)).toBe(0);
    });

    it('parses the stored value', async () => {
      const { models } = createModels({ [SyncFact.DATA_VERSION]: '2' });
      expect(await getStoredDataVersion(models)).toBe(2);
    });
  });

  describe('stampDataVersion', () => {
    it('writes the required version as a string', async () => {
      const { models, store } = createModels();
      await stampDataVersion(models);
      expect(models.localSystemFact.set).toHaveBeenCalledWith(
        SyncFact.DATA_VERSION,
        REQUIRED_DATA_VERSION.toString(),
      );
      expect(store.get(SyncFact.DATA_VERSION)).toBe(REQUIRED_DATA_VERSION.toString());
    });
  });

  describe('getDataVersionAction', () => {
    it('returns "stamp" when version missing and pull cursor is -1 (fresh install)', async () => {
      const { models } = createModels();
      mockGetSyncTick.mockResolvedValue(-1);
      expect(await getDataVersionAction(models)).toBe('stamp');
    });

    it('returns "reset" when version missing but there is synced data', async () => {
      const { models } = createModels();
      mockGetSyncTick.mockResolvedValue(123);
      expect(await getDataVersionAction(models)).toBe('reset');
    });

    it('returns "reset" when stored version 0 and there is synced data', async () => {
      const { models } = createModels({ [SyncFact.DATA_VERSION]: '0' });
      mockGetSyncTick.mockResolvedValue(123);
      expect(await getDataVersionAction(models)).toBe('reset');
    });

    it('returns "none" when stored version equals the required version', async () => {
      const { models } = createModels({ [SyncFact.DATA_VERSION]: '1' });
      expect(await getDataVersionAction(models)).toBe('none');
      expect(mockGetSyncTick).not.toHaveBeenCalled();
    });

    it('returns "none" when stored version is ahead of the required version', async () => {
      const { models } = createModels({ [SyncFact.DATA_VERSION]: '2' });
      expect(await getDataVersionAction(models)).toBe('none');
    });
  });
});
