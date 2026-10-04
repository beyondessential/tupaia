import { NextFunction } from 'express';

jest.mock('../utils/generateFrontendExcludedFilter', () => ({
  generateFrontendExcludedFilter: jest.fn().mockResolvedValue({}),
  getTypesToExclude: jest.fn().mockResolvedValue([]),
}));

import { EntitiesRoute } from '../routes/EntitiesRoute';

const getDescendantsOfEntity = jest.fn().mockResolvedValue([]);
const findById = jest.fn();

const makeMockRequest = (overwrites: any) => ({
  params: { projectCode: 'explore', rootEntityCode: 'WS' },
  query: { filter: {} },
  accessPolicy: {},
  models: {
    entity: { findById },
  },
  ctx: {
    services: {
      entity: { getDescendantsOfEntity },
    },
  },
  ...overwrites,
});

const mockResponse: any = { json: jest.fn(), status: jest.fn() };
const mockNext: NextFunction = jest.fn();

class TestableEntitiesRoute extends EntitiesRoute {
  public constructor(params: any) {
    const req = makeMockRequest(params);
    // @ts-ignore
    super(req, mockResponse, mockNext);
  }
}

describe('EntitiesRoute', () => {
  beforeEach(() => jest.clearAllMocks());

  it('resolves an in-project scan directly, skipping the code fallback', async () => {
    getDescendantsOfEntity.mockResolvedValue([
      { id: 'in-project-id', code: 'WS_h00001', name: 'Household', parent_code: 'OTHER' },
    ]);
    const route = new TestableEntitiesRoute({
      query: { filter: { id: 'in-project-id' } },
    });

    const result = await route.buildResponse();

    expect(findById).not.toHaveBeenCalled();
    expect(getDescendantsOfEntity).toHaveBeenCalledTimes(1);
    expect(result).toEqual([
      expect.objectContaining({ id: 'in-project-id', code: 'WS_h00001', name: 'Household' }),
    ]);
  });

  it('falls back to a code lookup when a scanned id misses in-project (QR of a duplicated entity)', async () => {
    getDescendantsOfEntity
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        { id: 'project-copy-id', code: 'WS_h00001', name: 'Household', parent_code: 'OTHER' },
      ]);
    findById.mockResolvedValue({ id: 'old-canonical-id', code: 'WS_h00001' });
    const route = new TestableEntitiesRoute({
      query: { filter: { id: 'old-canonical-id' } },
    });

    const result = await route.buildResponse();

    expect(findById).toHaveBeenCalledWith('old-canonical-id');
    expect(getDescendantsOfEntity).toHaveBeenCalledTimes(2);

    const firstOptions = getDescendantsOfEntity.mock.calls[0][2];
    expect(firstOptions.filter).toEqual(expect.objectContaining({ id: 'old-canonical-id' }));

    const [secondProject, secondRoot, secondOptions, secondIncludeRoot] =
      getDescendantsOfEntity.mock.calls[1];
    expect(secondProject).toBe('explore');
    expect(secondRoot).toBe('WS');
    expect(secondIncludeRoot).toBe(false);
    expect(secondOptions.filter).toEqual(expect.objectContaining({ code: 'WS_h00001' }));
    expect(secondOptions.filter).not.toHaveProperty('id');

    expect(result).toEqual([
      expect.objectContaining({ id: 'project-copy-id', code: 'WS_h00001', name: 'Household' }),
    ]);
  });

  it('preserves includeRootEntity when re-querying by code', async () => {
    getDescendantsOfEntity
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        { id: 'project-copy-id', code: 'WS_h00001', name: 'Household', parent_code: 'OTHER' },
      ]);
    findById.mockResolvedValue({ id: 'old-canonical-id', code: 'WS_h00001' });
    const route = new TestableEntitiesRoute({
      query: { filter: { id: 'old-canonical-id' }, includeRootEntity: true },
    });

    await route.buildResponse();

    const secondIncludeRoot = getDescendantsOfEntity.mock.calls[1][3];
    expect(secondIncludeRoot).toBe(true);
  });

  it('returns an empty result (no throw) when a scanned id resolves to no entity at all', async () => {
    getDescendantsOfEntity.mockResolvedValue([]);
    findById.mockResolvedValue(null);
    const route = new TestableEntitiesRoute({
      query: { filter: { id: 'genuinely-missing' } },
    });

    await expect(route.buildResponse()).resolves.toEqual([]);
    expect(findById).toHaveBeenCalledWith('genuinely-missing');
    // Fallback skipped when the id resolves to no code, so no second query.
    expect(getDescendantsOfEntity).toHaveBeenCalledTimes(1);
  });

  it('does not fall back when the filter already constrains by code', async () => {
    getDescendantsOfEntity.mockResolvedValue([]);
    findById.mockResolvedValue({ id: 'old-canonical-id', code: 'WS_h00001' });
    const route = new TestableEntitiesRoute({
      query: { filter: { id: 'old-canonical-id', code: 'WS_h00001' } },
    });

    await route.buildResponse();

    expect(findById).not.toHaveBeenCalled();
    expect(getDescendantsOfEntity).toHaveBeenCalledTimes(1);
  });

  it('does not fall back when the scanned id is not a string', async () => {
    getDescendantsOfEntity.mockResolvedValue([]);
    findById.mockResolvedValue({ id: 'x', code: 'WS_h00001' });
    const route = new TestableEntitiesRoute({
      query: { filter: { id: { comparator: '=', comparisonValue: 'not-a-bare-id' } } },
    });

    await route.buildResponse();

    expect(findById).not.toHaveBeenCalled();
    expect(getDescendantsOfEntity).toHaveBeenCalledTimes(1);
  });
});
