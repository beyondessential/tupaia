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
});
