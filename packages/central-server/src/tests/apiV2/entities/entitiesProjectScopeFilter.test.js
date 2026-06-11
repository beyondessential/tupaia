import { expect } from 'chai';
import { buildAndInsertProjectsAndHierarchies } from '@tupaia/database';
import { TestableApp, resetTestData } from '../../testUtilities';

// Mirrors the scope filter that admin-panel-server's projectScope middleware
// injects for the Entities tab. It must resolve to
//   (project_id = X) OR (type = 'country' AND code IN (...))
// so the tab shows the project's own (sub-country) entities plus the shared
// country entities it spans — and nothing from other projects. A naive reading
// of the conjunction keys could invert this to
//   project_id = X AND (type = 'country' OR code IN (...))
// which would drop the project's villages; this test guards against that.
const scopeFilter = (projectId, countryCodes) => ({
  _and_: {
    project_id: projectId,
    _or_: { type: 'country', code: countryCodes },
  },
});

describe('Entities tab project-scope filter (TUP-3180)', () => {
  const app = new TestableApp();
  const { models } = app;
  let project;

  before(async () => {
    await resetTestData();
    await buildAndInsertProjectsAndHierarchies(models, [
      {
        code: 'scope_filter_a',
        name: 'Scope Filter A',
        entities: [
          { code: 'KI', country_code: 'KI' },
          { code: 'VU', country_code: 'VU' },
          { code: 'KI_scope_v1', country_code: 'KI', type: 'village', parent_code: 'KI' },
          { code: 'VU_scope_v1', country_code: 'VU', type: 'village', parent_code: 'VU' },
        ],
      },
      {
        code: 'scope_filter_b',
        name: 'Scope Filter B',
        entities: [
          { code: 'FJ', country_code: 'FJ' },
          { code: 'FJ_scope_v1', country_code: 'FJ', type: 'village', parent_code: 'FJ' },
        ],
      },
    ]);
    project = await models.project.findOne({ code: 'scope_filter_a' });
  });

  it('returns the project entities and its country entities, excluding other projects and unrelated countries', async () => {
    const rows = await models.entity.find(scopeFilter(project.id, ['KI', 'VU']));
    const codes = new Set(rows.map(r => r.code));

    // The project's own sub-country entities (matched by project_id).
    expect(codes.has('KI_scope_v1')).to.equal(true);
    expect(codes.has('VU_scope_v1')).to.equal(true);
    // The project's shared country entities (project_id NULL, matched by code).
    expect(codes.has('KI')).to.equal(true);
    expect(codes.has('VU')).to.equal(true);
    // Not another project's entities, nor a country outside this project.
    expect(codes.has('FJ')).to.equal(false);
    expect(codes.has('FJ_scope_v1')).to.equal(false);
  });
});
