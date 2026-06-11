import { expect } from 'chai';
import { buildAndInsertProjectsAndHierarchies } from '@tupaia/database';
import { TestableApp, resetTestData } from '../../testUtilities';
import { BES_ADMIN_PERMISSION_GROUP } from '../../../permissions';

const BES_ADMIN_POLICY = { KI: [BES_ADMIN_PERMISSION_GROUP], VU: [BES_ADMIN_PERMISSION_GROUP] };

// Reproduces the request the admin-panel Entities tab makes once the
// projectScope middleware has injected its scope filter: a project.code column
// (which joins the project table) plus a conjunction filter resolving to
//   (project_id = X) OR (type = 'country' AND code IN (...))
// The tab must list the project's own (sub-country) entities and the shared
// country entities it spans, while hiding other projects and unrelated rows.
// This exercises two things a model-level find() doesn't: processColumnSelectorKeys
// (which must leave _and_/_or_ intact rather than treating them as columns) and
// the LEFT join (so country rows with a null project_id aren't dropped).
const buildQuery = (projectId, countryCodes) => {
  const columns = JSON.stringify([
    'id',
    'code',
    'name',
    'type',
    'country_code',
    'parent_code',
    'project.code',
  ]);
  const filter = JSON.stringify({
    _and_: {
      project_id: projectId,
      _or_: { type: 'country', code: countryCodes },
    },
  });
  return (
    `entities?columns=${encodeURIComponent(columns)}` +
    `&filter=${encodeURIComponent(filter)}&sort=${encodeURIComponent('[]')}`
  );
};

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

  afterEach(() => {
    app.revokeAccess();
  });

  it('lists the project entities and its country entities, excluding other projects and unrelated countries', async () => {
    await app.grantAccess(BES_ADMIN_POLICY);
    const response = await app.get(buildQuery(project.id, ['KI', 'VU']));
    expect(response.statusCode).to.equal(200);

    const codes = new Set(response.body.map(row => row.code));
    // The project's own sub-country entities (matched by project_id).
    expect(codes.has('KI_scope_v1')).to.equal(true);
    expect(codes.has('VU_scope_v1')).to.equal(true);
    // The project's shared country entities (project_id NULL, matched by code) —
    // present only because the project join is a LEFT join.
    expect(codes.has('KI')).to.equal(true);
    expect(codes.has('VU')).to.equal(true);
    // Not another project's entities, nor a country outside this project.
    expect(codes.has('FJ')).to.equal(false);
    expect(codes.has('FJ_scope_v1')).to.equal(false);
  });
});
