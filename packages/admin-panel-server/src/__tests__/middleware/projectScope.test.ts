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
    // country_code ∈ project countries is the orphan boundary: a sub-country
    // entity keeps its project_id after its country leaves the project, so
    // without this it would still show. Matching the export.
    expect(filter._and_.country_code).toEqual(['TO', 'VU']);
    // ...AND (belongs to this project OR is a shared country entity).
    expect(filter._and_._and_).toEqual({
      project_id: 'project-1',
      _or_: { type: 'country' },
    });

    // The country list must appear ONLY ONCE in the forwarded query string —
    // duplicating it (once as country_code, once as a code array) previously
    // bloated the pagination Link header past the reverse proxy's buffer and
    // 502'd many-country projects like Explore.
    const rawFilter = new URL(req.url, 'http://localhost').searchParams.get('filter') as string;
    expect(rawFilter.split('"VU"').length - 1).toBe(1);
  });
});
