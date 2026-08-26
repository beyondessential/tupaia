import { findOrCreateDummyRecord, upsertDummyRecord } from '@tupaia/database';
import { buildAccessPolicy } from '../../buildAccessPolicy';
import { setUp } from './helpers';

const setUpBranchingHierarchy = async models => {
  const orgAdmin = await findOrCreateDummyRecord(models.permissionGroup, {
    name: 'OrgAdmin',
  });
  const countryAdmin = await findOrCreateDummyRecord(
    models.permissionGroup,
    { name: 'CountryAdmin' },
    { parent_id: orgAdmin.id },
  );
  const districtViewer = await findOrCreateDummyRecord(
    models.permissionGroup,
    { name: 'DistrictViewer' },
    { parent_id: countryAdmin.id },
  );
  const districtEditor = await findOrCreateDummyRecord(
    models.permissionGroup,
    { name: 'DistrictEditor' },
    { parent_id: countryAdmin.id },
  );
  const externalPartner = await findOrCreateDummyRecord(
    models.permissionGroup,
    { name: 'ExternalPartner' },
    { parent_id: orgAdmin.id },
  );
  const externalViewer = await findOrCreateDummyRecord(
    models.permissionGroup,
    { name: 'ExternalViewer' },
    { parent_id: externalPartner.id },
  );

  return {
    orgAdmin,
    countryAdmin,
    districtViewer,
    districtEditor,
    externalPartner,
    externalViewer,
  };
};

const setUpDeepHierarchy = async models => {
  const level1 = await findOrCreateDummyRecord(models.permissionGroup, { name: 'Level1' });
  const level2 = await findOrCreateDummyRecord(
    models.permissionGroup,
    { name: 'Level2' },
    { parent_id: level1.id },
  );
  const level3 = await findOrCreateDummyRecord(
    models.permissionGroup,
    { name: 'Level3' },
    { parent_id: level2.id },
  );
  const level4 = await findOrCreateDummyRecord(
    models.permissionGroup,
    { name: 'Level4' },
    { parent_id: level3.id },
  );
  const level5 = await findOrCreateDummyRecord(
    models.permissionGroup,
    { name: 'Level5' },
    { parent_id: level4.id },
  );

  return { level1, level2, level3, level4, level5 };
};

export const testComplexPermissionHierarchies = () => {
  let models;
  let permissionGroups;

  beforeAll(async () => {
    ({ models, permissionGroups } = await setUp());
    await setUpBranchingHierarchy(models);
    await setUpDeepHierarchy(models);
  });

  describe('branching hierarchy', () => {
    it('expands a mid-level permission to its descendants only', async () => {
      const user = await upsertDummyRecord(models.user);
      const fiji = await findOrCreateDummyRecord(
        models.entity,
        { code: 'FJ' },
        { name: 'Fiji', type: 'country' },
      );
      const { countryAdmin } = await setUpBranchingHierarchy(models);

      await upsertDummyRecord(models.userEntityPermission, {
        user_id: user.id,
        entity_id: fiji.id,
        permission_group_id: countryAdmin.id,
      });

      const accessPolicy = await buildAccessPolicy(models, user.id);

      expect(accessPolicy.FJ).toEqual(
        expect.arrayContaining(['CountryAdmin', 'DistrictViewer', 'DistrictEditor']),
      );
      expect(accessPolicy.FJ).toHaveLength(3);
      expect(accessPolicy.FJ).not.toContain('OrgAdmin');
      expect(accessPolicy.FJ).not.toContain('ExternalPartner');
    });

    it('expands a root permission across all descendant branches', async () => {
      const user = await upsertDummyRecord(models.user);
      const samoa = await findOrCreateDummyRecord(
        models.entity,
        { code: 'WS' },
        { name: 'Samoa', type: 'country' },
      );
      const { orgAdmin } = await setUpBranchingHierarchy(models);

      await upsertDummyRecord(models.userEntityPermission, {
        user_id: user.id,
        entity_id: samoa.id,
        permission_group_id: orgAdmin.id,
      });

      const accessPolicy = await buildAccessPolicy(models, user.id);

      expect(accessPolicy.WS).toEqual(
        expect.arrayContaining([
          'OrgAdmin',
          'CountryAdmin',
          'DistrictViewer',
          'DistrictEditor',
          'ExternalPartner',
          'ExternalViewer',
        ]),
      );
      expect(accessPolicy.WS).toHaveLength(6);
    });

    it('unions permissions from sibling branches on the same entity', async () => {
      const user = await upsertDummyRecord(models.user);
      const vanuatu = await findOrCreateDummyRecord(
        models.entity,
        { code: 'VU' },
        { name: 'Vanuatu', type: 'country' },
      );
      const { districtViewer, externalPartner } = await setUpBranchingHierarchy(models);

      await upsertDummyRecord(models.userEntityPermission, {
        user_id: user.id,
        entity_id: vanuatu.id,
        permission_group_id: districtViewer.id,
      });
      await upsertDummyRecord(models.userEntityPermission, {
        user_id: user.id,
        entity_id: vanuatu.id,
        permission_group_id: externalPartner.id,
      });

      const accessPolicy = await buildAccessPolicy(models, user.id);

      expect(accessPolicy.VU).toEqual(
        expect.arrayContaining(['DistrictViewer', 'ExternalPartner', 'ExternalViewer']),
      );
      expect(accessPolicy.VU).toHaveLength(3);
      expect(accessPolicy.VU).not.toContain('CountryAdmin');
      expect(accessPolicy.VU).not.toContain('DistrictEditor');
    });

    it('isolates sibling branch permissions on different entities', async () => {
      const user = await upsertDummyRecord(models.user);
      const kiribati = await findOrCreateDummyRecord(
        models.entity,
        { code: 'KI' },
        { name: 'Kiribati', type: 'country' },
      );
      const solomonIslands = await findOrCreateDummyRecord(
        models.entity,
        { code: 'SB' },
        { name: 'Solomon Islands', type: 'country' },
      );
      const { districtEditor, externalViewer } = await setUpBranchingHierarchy(models);

      await upsertDummyRecord(models.userEntityPermission, {
        user_id: user.id,
        entity_id: kiribati.id,
        permission_group_id: districtEditor.id,
      });
      await upsertDummyRecord(models.userEntityPermission, {
        user_id: user.id,
        entity_id: solomonIslands.id,
        permission_group_id: externalViewer.id,
      });

      const accessPolicy = await buildAccessPolicy(models, user.id);

      expect(accessPolicy.KI).toEqual(['DistrictEditor']);
      expect(accessPolicy.SB).toEqual(['ExternalViewer']);
    });
  });

  describe('deep hierarchy', () => {
    it('expands a top-level permission through five levels', async () => {
      const user = await upsertDummyRecord(models.user);
      const entity = await findOrCreateDummyRecord(
        models.entity,
        { code: 'DEEP' },
        { name: 'Deep Hierarchy Entity', type: 'country' },
      );
      const { level1 } = await setUpDeepHierarchy(models);

      await upsertDummyRecord(models.userEntityPermission, {
        user_id: user.id,
        entity_id: entity.id,
        permission_group_id: level1.id,
      });

      const accessPolicy = await buildAccessPolicy(models, user.id);

      expect(accessPolicy.DEEP).toEqual(
        expect.arrayContaining(['Level1', 'Level2', 'Level3', 'Level4', 'Level5']),
      );
      expect(accessPolicy.DEEP).toHaveLength(5);
    });

    it('expands a leaf permission without including ancestors', async () => {
      const user = await upsertDummyRecord(models.user);
      const leafEntity = await findOrCreateDummyRecord(
        models.entity,
        { code: 'LEAF' },
        { name: 'Leaf Entity', type: 'country' },
      );
      const { level5 } = await setUpDeepHierarchy(models);

      await upsertDummyRecord(models.userEntityPermission, {
        user_id: user.id,
        entity_id: leafEntity.id,
        permission_group_id: level5.id,
      });

      const accessPolicy = await buildAccessPolicy(models, user.id);

      expect(accessPolicy.LEAF).toEqual(['Level5']);
    });

    it('expands a mid-level permission to its descendants only', async () => {
      const user = await upsertDummyRecord(models.user);
      const midEntity = await findOrCreateDummyRecord(
        models.entity,
        { code: 'MID' },
        { name: 'Mid-level Entity', type: 'country' },
      );
      const { level3 } = await setUpDeepHierarchy(models);

      await upsertDummyRecord(models.userEntityPermission, {
        user_id: user.id,
        entity_id: midEntity.id,
        permission_group_id: level3.id,
      });

      const accessPolicy = await buildAccessPolicy(models, user.id);

      expect(accessPolicy.MID).toEqual(expect.arrayContaining(['Level3', 'Level4', 'Level5']));
      expect(accessPolicy.MID).toHaveLength(3);
      expect(accessPolicy.MID).not.toContain('Level1');
      expect(accessPolicy.MID).not.toContain('Level2');
    });
  });

  describe('overlapping permissions on one entity', () => {
    it('deduplicates when a child permission is also granted directly', async () => {
      const user = await upsertDummyRecord(models.user);
      const entity = await findOrCreateDummyRecord(
        models.entity,
        { code: 'OVERLAP' },
        { name: 'Overlap Entity', type: 'country' },
      );

      await upsertDummyRecord(models.userEntityPermission, {
        user_id: user.id,
        entity_id: entity.id,
        permission_group_id: permissionGroups.admin.id,
      });
      await upsertDummyRecord(models.userEntityPermission, {
        user_id: user.id,
        entity_id: entity.id,
        permission_group_id: permissionGroups.public.id,
      });

      const accessPolicy = await buildAccessPolicy(models, user.id);

      expect(accessPolicy.OVERLAP).toEqual(
        expect.arrayContaining(['Admin', 'Donor', 'Public']),
      );
      expect(accessPolicy.OVERLAP).toHaveLength(3);
    });

    it('unions non-overlapping permission subtrees on the same entity', async () => {
      const user = await upsertDummyRecord(models.user);
      const overlapEntity = await findOrCreateDummyRecord(
        models.entity,
        { code: 'UNION' },
        { name: 'Union Entity', type: 'country' },
      );
      const { externalPartner } = await setUpBranchingHierarchy(models);

      await upsertDummyRecord(models.userEntityPermission, {
        user_id: user.id,
        entity_id: overlapEntity.id,
        permission_group_id: permissionGroups.donor.id,
      });
      await upsertDummyRecord(models.userEntityPermission, {
        user_id: user.id,
        entity_id: overlapEntity.id,
        permission_group_id: externalPartner.id,
      });

      const accessPolicy = await buildAccessPolicy(models, user.id);

      expect(accessPolicy.UNION).toEqual(
        expect.arrayContaining(['Donor', 'Public', 'ExternalPartner', 'ExternalViewer']),
      );
      expect(accessPolicy.UNION).toHaveLength(4);
      expect(accessPolicy.UNION).not.toContain('Admin');
      expect(accessPolicy.UNION).not.toContain('CountryAdmin');
    });
  });
};
