import {
  findAccessibleGroupedMapOverlays,
  findAccessibleMapOverlays,
} from '/apiV1/utils/findAccessibleGroupedMapOverlays';

const makeOverlay = (id, { hideFromMenu = false, reference, name = `Overlay ${id}` } = {}) => ({
  id,
  code: `CODE_${id}`,
  name,
  config: {
    hideFromMenu,
    ...(reference ? { info: { reference } } : {}),
  },
  report_code: `REPORT_${id}`,
  legacy: false,
});

const makeGroupRelation = (childId, childType, sortOrder, childRelations = []) => ({
  child_id: childId,
  child_type: childType,
  sort_order: sortOrder,
  findChildRelations: jest.fn().mockResolvedValue(childRelations),
});

const createModels = ({
  topLevelGroups = [],
  groupRelationsByGroupId = {},
  worldRelations = [],
  mapOverlayGroupsById = {},
  mapOverlays = [],
} = {}) => ({
  mapOverlayGroup: {
    findTopLevelMapOverlayGroups: jest.fn().mockResolvedValue(topLevelGroups),
    find: jest.fn().mockImplementation(({ id }) =>
      Promise.resolve(id.map(groupId => mapOverlayGroupsById[groupId]).filter(Boolean)),
    ),
  },
  mapOverlayGroupRelation: {
    findGroupRelations: jest.fn().mockResolvedValue(
      Object.entries(groupRelationsByGroupId).flatMap(([groupId, relations]) =>
        relations.map(relation => ({
          ...relation,
          map_overlay_group_id: groupId,
        })),
      ),
    ),
    findTopLevelMapOverlayGroupRelations: jest.fn().mockResolvedValue(worldRelations),
  },
  mapOverlay: {
    find: jest.fn().mockResolvedValue(mapOverlays),
  },
});

describe('findAccessibleMapOverlays', () => {
  it('queries overlays by permission group, project, and country code', async () => {
    const models = createModels({
      mapOverlays: [{ id: 'overlay-1', code: 'OV1' }],
    });

    const result = await findAccessibleMapOverlays(models, 'TO', 'explore', [
      'Public',
      'Admin',
    ]);

    expect(models.mapOverlay.find).toHaveBeenCalledOnceWith(
      expect.objectContaining({
        RAW: expect.objectContaining({
          parameters: ['Public', 'Admin'],
        }),
        AND: expect.objectContaining({
          AND: expect.objectContaining({
            project_codes: expect.objectContaining({
              comparisonValue: ['explore'],
            }),
          }),
        }),
      }),
    );
    expect(result).toEqual({ 'overlay-1': { id: 'overlay-1', code: 'OV1' } });
  });
});

describe('findAccessibleGroupedMapOverlays', () => {
  it('returns accessible top-level groups with visible overlays and stable ordering', async () => {
    const accessibleMapOverlays = {
      'overlay-1': makeOverlay('overlay-1', { name: 'Beta overlay' }),
      'overlay-2': makeOverlay('overlay-2', { hideFromMenu: true }),
      'overlay-3': makeOverlay('overlay-3', { name: 'Alpha overlay' }),
    };

    const models = createModels({
      topLevelGroups: [
        { id: 'group-empty', name: 'Empty group' },
        { id: 'group-visible', name: 'Visible group' },
      ],
      groupRelationsByGroupId: {
        'group-empty': [
          makeGroupRelation('overlay-2', 'mapOverlay', 1),
        ],
        'group-visible': [
          makeGroupRelation('overlay-3', 'mapOverlay', 2),
          makeGroupRelation('overlay-1', 'mapOverlay', 1),
        ],
      },
      worldRelations: [
        { child_id: 'group-empty', sort_order: 2 },
        { child_id: 'group-visible', sort_order: 1 },
      ],
    });

    await expect(
      findAccessibleGroupedMapOverlays(models, accessibleMapOverlays),
    ).resolves.toEqual([
      {
        name: 'Visible group',
        children: [
          {
            mapOverlayCode: 'CODE_overlay-1',
            code: 'CODE_overlay-1',
            name: 'Beta overlay',
            hideFromMenu: false,
            reportCode: 'REPORT_overlay-1',
            legacy: false,
          },
          {
            mapOverlayCode: 'CODE_overlay-3',
            code: 'CODE_overlay-3',
            name: 'Alpha overlay',
            hideFromMenu: false,
            reportCode: 'REPORT_overlay-3',
            legacy: false,
          },
        ],
      },
    ]);
  });

  it('returns nested groups and hoists a shared child reference to the group', async () => {
    const sharedReference = { source: 'WHO', year: 2024 };
    const accessibleMapOverlays = {
      'overlay-3': makeOverlay('overlay-3', { reference: sharedReference }),
      'overlay-4': makeOverlay('overlay-4', { reference: sharedReference }),
    };

    const nestedGroupRelations = [
      makeGroupRelation('overlay-3', 'mapOverlay', 1),
      makeGroupRelation('overlay-4', 'mapOverlay', 2),
    ];
    const topLevelRelations = [
      makeGroupRelation('nested-group', 'mapOverlayGroup', 1, nestedGroupRelations),
    ];

    const models = createModels({
      topLevelGroups: [{ id: 'top-group', name: 'Top group' }],
      groupRelationsByGroupId: {
        'top-group': topLevelRelations,
      },
      mapOverlayGroupsById: {
        'nested-group': { id: 'nested-group', name: 'Nested group' },
      },
      worldRelations: [{ child_id: 'top-group', sort_order: 1 }],
    });

    await expect(
      findAccessibleGroupedMapOverlays(models, accessibleMapOverlays),
    ).resolves.toEqual([
      {
        name: 'Top group',
        children: [
          {
            name: 'Nested group',
            children: [
              {
                mapOverlayCode: 'CODE_overlay-3',
                code: 'CODE_overlay-3',
                name: 'Overlay overlay-3',
                hideFromMenu: false,
                reportCode: 'REPORT_overlay-3',
                legacy: false,
                info: {},
              },
              {
                mapOverlayCode: 'CODE_overlay-4',
                code: 'CODE_overlay-4',
                name: 'Overlay overlay-4',
                hideFromMenu: false,
                reportCode: 'REPORT_overlay-4',
                legacy: false,
                info: {},
              },
            ],
            info: { reference: sharedReference },
          },
        ],
      },
    ]);
  });

  it('keeps child references when they differ within a nested group', async () => {
    const accessibleMapOverlays = {
      'overlay-3': makeOverlay('overlay-3', { reference: { source: 'WHO' } }),
      'overlay-5': makeOverlay('overlay-5', { reference: { source: 'UN' } }),
    };

    const nestedGroupRelations = [
      makeGroupRelation('overlay-3', 'mapOverlay', 1),
      makeGroupRelation('overlay-5', 'mapOverlay', 2),
    ];

    const models = createModels({
      topLevelGroups: [{ id: 'top-group', name: 'Top group' }],
      groupRelationsByGroupId: {
        'top-group': [
          makeGroupRelation('nested-group', 'mapOverlayGroup', 1, nestedGroupRelations),
        ],
      },
      mapOverlayGroupsById: {
        'nested-group': { id: 'nested-group', name: 'Nested group' },
      },
      worldRelations: [{ child_id: 'top-group', sort_order: 1 }],
    });

    const [result] = await findAccessibleGroupedMapOverlays(models, accessibleMapOverlays);

    expect(result.children[0]).toEqual({
      name: 'Nested group',
      children: [
        expect.objectContaining({
          mapOverlayCode: 'CODE_overlay-3',
          info: { reference: { source: 'WHO' } },
        }),
        expect.objectContaining({
          mapOverlayCode: 'CODE_overlay-5',
          info: { reference: { source: 'UN' } },
        }),
      ],
    });
    expect(result.children[0].info).toBeUndefined();
  });

  it('excludes groups whose nested children are empty', async () => {
    const models = createModels({
      topLevelGroups: [{ id: 'group-empty-nested', name: 'Empty nested group' }],
      groupRelationsByGroupId: {
        'group-empty-nested': [
          makeGroupRelation('nested-group', 'mapOverlayGroup', 1, []),
        ],
      },
      mapOverlayGroupsById: {
        'nested-group': { id: 'nested-group', name: 'Nested group' },
      },
      worldRelations: [{ child_id: 'group-empty-nested', sort_order: 1 }],
    });

    await expect(
      findAccessibleGroupedMapOverlays(models, {}),
    ).resolves.toEqual([]);
  });
});
