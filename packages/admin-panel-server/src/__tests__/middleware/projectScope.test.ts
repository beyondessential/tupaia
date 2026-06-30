import { NextFunction, Request, Response } from 'express';

import { applyProjectScope } from '../../middleware/projectScope';

const buildReq = (url: string, project: unknown) => ({
  originalUrl: url,
  url,
  method: 'GET',
  body: {},
  is: () => false,
  models: { project: { findOne: jest.fn().mockResolvedValue(project) } },
});

const parseForwardedFilter = (req: { url: string }) => {
  const url = new URL(req.url, 'http://localhost');
  return JSON.parse(url.searchParams.get('filter') as string);
};

describe('applyProjectScope — entities list filter', () => {
  it("scopes the entities list to the project AND its project_country countries (so orphans don't linger)", async () => {
    const project = {
      id: 'project-1',
      code: 'test_project',
      countries: async () => [{ code: 'TO' }, { code: 'VU' }],
    };
    const req = buildReq('/entities?projectCode=test_project', project);
    const next: NextFunction = jest.fn();

    await applyProjectScope(req as unknown as Request, {} as Response, next);

    expect(next).toHaveBeenCalled();
    const filter = parseForwardedFilter(req);
    expect(filter._and_.project_id).toBe('project-1');
    // The country_code membership is the key part: a sub-country entity keeps
    // its project_id after its country is removed from the project, so without
    // this it would still show. Requiring country_code ∈ project countries
    // excludes those orphans (matching the export).
    expect(filter._and_.country_code).toEqual(['TO', 'VU']);
    // Shared country entities are matched by code on the OR branch.
    expect(filter._and_._or_).toEqual({ type: 'country', code: ['TO', 'VU'] });
  });
});
