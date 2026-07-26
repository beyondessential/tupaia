import { NextFunction } from 'express';
import { EntityDescendantsRoute } from '../routes';

const getDescendantsOfEntity = jest.fn().mockResolvedValue([]);
const fetchResources = jest.fn().mockResolvedValue([]);
const findById = jest.fn();

const makeMockRequest = (overwrites: any) => ({
  query: { filter: {} },
  session: undefined,
  models: {
    entity: { findById },
  },
  ctx: {
    services: {
      entity: { getDescendantsOfEntity },
      // Present so we can assert the parent lookup no longer routes through the
      // admin-panel-scoped central entities endpoint (the cause of the 500).
      central: { fetchResources },
    },
  },
  ...overwrites,
});

const mockResponse: any = { json: jest.fn(), status: jest.fn() };
const mockNext: NextFunction = jest.fn();

class TestableEntityDescendantsRoute extends EntityDescendantsRoute {
  public constructor(params: any) {
    const req = makeMockRequest(params);
    // @ts-ignore
    super(req, mockResponse, mockNext);
  }
}

describe('EntityDescendantsRoute', () => {
  beforeEach(() => jest.clearAllMocks());

  it('resolves parentId → code via the DB (not the admin-panel-scoped central endpoint) and filters to children', async () => {
    findById.mockResolvedValue({ id: 'parent-id', code: 'PARENT_CODE' });
    const route = new TestableEntityDescendantsRoute({
      query: { filter: { projectCode: 'explore', countryCode: 'DL', parentId: 'parent-id' } },
    });

    await route.buildResponse();

    expect(findById).toHaveBeenCalledWith('parent-id');
    expect(fetchResources).not.toHaveBeenCalled();
    expect(getDescendantsOfEntity).toHaveBeenCalledWith(
      'explore',
      'PARENT_CODE',
      expect.objectContaining({
        filter: expect.objectContaining({
          generational_distance: { comparator: '=', comparisonValue: 1 },
        }),
      }),
      false,
      true,
    );
  });

  it('resolves grandparentId → code and filters to grandchildren', async () => {
    findById.mockResolvedValue({ id: 'gp-id', code: 'GRANDPARENT_CODE' });
    const route = new TestableEntityDescendantsRoute({
      query: { filter: { projectCode: 'explore', countryCode: 'DL', grandparentId: 'gp-id' } },
    });

    await route.buildResponse();

    expect(findById).toHaveBeenCalledWith('gp-id');
    expect(getDescendantsOfEntity).toHaveBeenCalledWith(
      'explore',
      'GRANDPARENT_CODE',
      expect.objectContaining({
        filter: expect.objectContaining({
          generational_distance: { comparator: '=', comparisonValue: 2 },
        }),
      }),
      false,
      true,
    );
  });

  it('throws a clear error (not a cryptic destructure) when the parent id has no entity', async () => {
    findById.mockResolvedValue(null);
    const route = new TestableEntityDescendantsRoute({
      query: { filter: { projectCode: 'explore', countryCode: 'DL', parentId: 'missing-id' } },
    });

    await expect(route.buildResponse()).rejects.toThrow('No entity found with id missing-id');
  });

  it('falls back to a code lookup when a scanned id misses in-project (QR of a duplicated entity)', async () => {
    getDescendantsOfEntity
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ id: 'project-copy-id', code: 'SHARED', name: 'Shared Entity' }]);
    findById.mockResolvedValue({ id: 'old-canonical-id', code: 'SHARED' });
    const route = new TestableEntityDescendantsRoute({
      query: { filter: { projectCode: 'explore', countryCode: 'DL', id: 'old-canonical-id' } },
    });

    const result = await route.buildResponse();

    expect(findById).toHaveBeenCalledWith('old-canonical-id');
    expect(getDescendantsOfEntity).toHaveBeenCalledTimes(2);

    const [firstFilter] = getDescendantsOfEntity.mock.calls[0].slice(2);
    expect(firstFilter.filter).toEqual(expect.objectContaining({ id: 'old-canonical-id' }));

    const [secondFilter] = getDescendantsOfEntity.mock.calls[1].slice(2);
    expect(secondFilter.filter).toEqual(
      expect.objectContaining({ code: 'SHARED', country_code: 'DL' }),
    );
    expect(secondFilter.filter).not.toHaveProperty('id');

    expect(result).toEqual([
      expect.objectContaining({ id: 'project-copy-id', code: 'SHARED', name: 'Shared Entity' }),
    ]);
  });

  it('returns an empty result (no throw) when a scanned id resolves to no entity at all', async () => {
    getDescendantsOfEntity.mockResolvedValue([]);
    findById.mockResolvedValue(null);
    const route = new TestableEntityDescendantsRoute({
      query: { filter: { projectCode: 'explore', countryCode: 'DL', id: 'genuinely-missing' } },
    });

    await expect(route.buildResponse()).resolves.toEqual([]);
    expect(findById).toHaveBeenCalledWith('genuinely-missing');
    // Fallback skipped when the id resolves to no code, so no second query.
    expect(getDescendantsOfEntity).toHaveBeenCalledTimes(1);
  });

  it('does not fall back when a scanned id already resolves in-project', async () => {
    getDescendantsOfEntity.mockResolvedValue([
      { id: 'in-project-id', code: 'ASSET1', name: 'Tonga Asset' },
    ]);
    const route = new TestableEntityDescendantsRoute({
      query: { filter: { projectCode: 'explore', countryCode: 'DL', id: 'in-project-id' } },
    });

    const result = await route.buildResponse();

    expect(findById).not.toHaveBeenCalled();
    expect(getDescendantsOfEntity).toHaveBeenCalledTimes(1);
    expect(result).toEqual([
      expect.objectContaining({ id: 'in-project-id', code: 'ASSET1', name: 'Tonga Asset' }),
    ]);
  });

  it('does not trigger the scan fallback on the parentId flow (empty children stay empty)', async () => {
    getDescendantsOfEntity.mockResolvedValue([]);
    findById.mockResolvedValue({ id: 'parent-id', code: 'PARENT_CODE' });
    const route = new TestableEntityDescendantsRoute({
      query: { filter: { projectCode: 'explore', countryCode: 'DL', parentId: 'parent-id' } },
    });

    await route.buildResponse();

    // findById is called once to resolve the parent, NOT a second time for a fallback.
    expect(findById).toHaveBeenCalledTimes(1);
    expect(getDescendantsOfEntity).toHaveBeenCalledTimes(1);
  });
});
