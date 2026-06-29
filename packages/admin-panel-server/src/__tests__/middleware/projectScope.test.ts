import { NextFunction, Request, Response } from 'express';

import { applyProjectScope } from '../../middleware/projectScope';

const BES_ADMIN_PERMISSION_GROUP = 'BES Admin';

type Country = { code: string };

const buildProject = (countryCodes: string[]) => ({
  id: 'project-id',
  code: 'test_project',
  countries: async (): Promise<Country[]> => countryCodes.map(code => ({ code })),
});

const buildReq = ({
  url = '/surveys?projectCode=test_project',
  method = 'GET',
  isBESAdmin = false,
  adminPanelCountryCodes = [] as string[],
  project = buildProject(['DL']) as ReturnType<typeof buildProject> | null,
}) => {
  const findOne = jest.fn().mockResolvedValue(project);
  const allowsSome = jest.fn().mockImplementation((_entities, permissionGroup) =>
    permissionGroup === BES_ADMIN_PERMISSION_GROUP ? isBESAdmin : false,
  );
  const getEntitiesAllowed = jest.fn().mockReturnValue(adminPanelCountryCodes);
  const req = {
    originalUrl: url,
    url,
    method,
    body: {},
    is: () => false,
    models: { project: { findOne } },
    accessPolicy: { allowsSome, getEntitiesAllowed },
  };
  return { req, findOne, allowsSome, getEntitiesAllowed };
};

const buildRes = () => {
  const res = {} as Record<string, jest.Mock>;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const run = (req: unknown, res: unknown) => {
  const next: NextFunction = jest.fn();
  return {
    next,
    promise: applyProjectScope(req as Request, res as unknown as Response, next),
  };
};

describe('applyProjectScope — Tupaia Admin Panel project access guard', () => {
  it('403s when a non-BES-admin lacks Tupaia Admin Panel access to any of the project’s countries', async () => {
    const { req } = buildReq({
      isBESAdmin: false,
      adminPanelCountryCodes: ['DL'],
      project: buildProject(['TO']), // user administers DL, project is only in TO
    });
    const res = buildRes();
    const { next, promise } = run(req, res);
    await promise;

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('allows a non-BES-admin who administers one of the project’s countries', async () => {
    const { req } = buildReq({
      isBESAdmin: false,
      adminPanelCountryCodes: ['DL'],
      project: buildProject(['DL', 'TO']),
    });
    const res = buildRes();
    const { next, promise } = run(req, res);
    await promise;

    expect(res.status).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });

  it('allows a BES admin regardless of country admin access', async () => {
    const { req, getEntitiesAllowed } = buildReq({
      isBESAdmin: true,
      adminPanelCountryCodes: [],
      project: buildProject(['TO']),
    });
    const res = buildRes();
    const { next, promise } = run(req, res);
    await promise;

    expect(res.status).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
    // BES admins skip the admin-panel-country lookup entirely.
    expect(getEntitiesAllowed).not.toHaveBeenCalled();
  });

  it('skips the guard entirely when no projectCode is supplied', async () => {
    const { req, findOne } = buildReq({ url: '/surveys' });
    const res = buildRes();
    const { next, promise } = run(req, res);
    await promise;

    expect(findOne).not.toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });
});
