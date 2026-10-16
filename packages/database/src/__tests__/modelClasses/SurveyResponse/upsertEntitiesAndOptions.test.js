import { upsertEntitiesAndOptions } from '../../../core/modelClasses/SurveyResponse/upsertEntitiesAndOptions';
import { getTestModels, upsertDummyRecord } from '../../../server/testUtilities';
import { generateId } from '../../../core/utilities';

describe('upsertEntitiesAndOptions', () => {
  const models = getTestModels();
  let optionSet;

  beforeAll(async () => {
    optionSet = await upsertDummyRecord(models.optionSet, { name: 'Test Option Set' });
  });

  afterAll(async () => {
    await models.option.delete({ option_set_id: optionSet.id });
    await models.optionSet.delete({ id: optionSet.id });
  });

  describe('upsertEntities', () => {
    let project;
    let country;
    let oldParent;
    let newParent;
    let asset;

    beforeAll(async () => {
      // entity.country_code is VARCHAR(6), and the child entities below set
      // country_code to this country's code — so the code must be <= 6 chars.
      const countryCode = `T${generateId().slice(0, 5)}`;
      country = await upsertDummyRecord(models.entity, {
        code: countryCode,
        name: 'Test Country',
        type: 'country',
        project_id: null,
      });
      project = await upsertDummyRecord(models.project, {
        code: `test_project_${generateId()}`,
      });
      oldParent = await upsertDummyRecord(models.entity, {
        code: `TEST_FACILITY_A_${generateId()}`,
        name: 'Old Parent',
        type: 'facility',
        country_code: country.code,
        parent_id: country.id,
        project_id: project.id,
      });
      newParent = await upsertDummyRecord(models.entity, {
        code: `TEST_FACILITY_B_${generateId()}`,
        name: 'New Parent',
        type: 'facility',
        country_code: country.code,
        parent_id: country.id,
        project_id: project.id,
      });
      asset = await upsertDummyRecord(models.entity, {
        code: `TEST_ASSET_${generateId()}`,
        name: 'Test Asset',
        type: 'asset',
        country_code: country.code,
        parent_id: oldParent.id,
        project_id: project.id,
      });
    });

    afterAll(async () => {
      if (asset) await models.entity.delete({ id: asset.id });
      if (oldParent) await models.entity.delete({ id: oldParent.id });
      if (newParent) await models.entity.delete({ id: newParent.id });
      if (project) await models.project.delete({ id: project.id });
      if (country) await models.entity.delete({ id: country.id });
    });

    it('preserves project_id when updating an existing entity by id (parent change)', async () => {
      await expect(
        upsertEntitiesAndOptions(models, [
          { entities_upserted: [{ id: asset.id, parent_id: newParent.id }] },
        ]),
      ).resolves.not.toThrow();

      const updated = await models.entity.findById(asset.id);
      expect(updated.parent_id).toBe(newParent.id);
      expect(updated.project_id).toBe(project.id);
    });

    it('upserts a new parent and new child in one batch even when the child is listed first', async () => {
      const parentId = generateId();
      const childId = generateId();

      // Child listed before its parent — must still succeed (parent upserted first to satisfy the FK).
      await expect(
        upsertEntitiesAndOptions(models, [
          {
            entities_upserted: [
              {
                id: childId,
                code: `TEST_NEW_CHILD_${childId}`,
                name: 'New Child',
                type: 'asset',
                country_code: country.code,
                parent_id: parentId,
                project_id: project.id,
              },
              {
                id: parentId,
                code: `TEST_NEW_PARENT_${parentId}`,
                name: 'New Parent',
                type: 'facility',
                country_code: country.code,
                parent_id: country.id,
                project_id: project.id,
              },
            ],
          },
        ]),
      ).resolves.not.toThrow();

      const child = await models.entity.findById(childId);
      expect(child.parent_id).toBe(parentId);

      await models.entity.delete({ id: childId });
      await models.entity.delete({ id: parentId });
    });

    it('throws on a cycle among the submitted entities', async () => {
      const aId = generateId();
      const bId = generateId();

      await expect(
        upsertEntitiesAndOptions(models, [
          {
            entities_upserted: [
              {
                id: aId,
                code: `TEST_CYCLE_A_${aId}`,
                name: 'Cycle A',
                type: 'asset',
                country_code: country.code,
                parent_id: bId,
                project_id: project.id,
              },
              {
                id: bId,
                code: `TEST_CYCLE_B_${bId}`,
                name: 'Cycle B',
                type: 'asset',
                country_code: country.code,
                parent_id: aId,
                project_id: project.id,
              },
            ],
          },
        ]),
      ).rejects.toThrow(/cycle detected/i);
    });
  });

  describe('createOptions', () => {
    afterEach(async () => {
      await models.option.delete({ option_set_id: optionSet.id });
    });

    it('should create a new option when none exists', async () => {
      await upsertEntitiesAndOptions(models, [
        {
          options_created: [
            {
              id: generateId(),
              value: 'New Option',
              option_set_id: optionSet.id,
            },
          ],
        },
      ]);

      const options = await models.option.find({ option_set_id: optionSet.id });
      expect(options).toHaveLength(1);
      expect(options[0].value).toBe('New Option');
    });

    it('should not change the existing option id when the same option_set_id+value is pushed again', async () => {
      const firstDeviceId = generateId();
      await upsertEntitiesAndOptions(models, [
        {
          options_created: [
            {
              id: firstDeviceId,
              value: 'PM-900',
              option_set_id: optionSet.id,
            },
          ],
        },
      ]);

      const [firstOption] = await models.option.find({
        option_set_id: optionSet.id,
        value: 'PM-900',
      });
      const originalId = firstOption.id;

      const secondDeviceId = generateId();
      await upsertEntitiesAndOptions(models, [
        {
          options_created: [
            {
              id: secondDeviceId,
              value: 'PM-900',
              option_set_id: optionSet.id,
            },
          ],
        },
      ]);

      const options = await models.option.find({ option_set_id: optionSet.id, value: 'PM-900' });
      expect(options).toHaveLength(1);
      expect(options[0].id).toBe(originalId);
      expect(options[0].id).not.toBe(secondDeviceId);
    });

    it('should work when options_created has no id field (DatatrakWeb path)', async () => {
      await upsertEntitiesAndOptions(models, [
        {
          options_created: [
            {
              value: 'DatatrakOption',
              option_set_id: optionSet.id,
              label: 'DatatrakOption',
            },
          ],
        },
      ]);

      const options = await models.option.find({
        option_set_id: optionSet.id,
        value: 'DatatrakOption',
      });
      expect(options).toHaveLength(1);
      expect(options[0].value).toBe('DatatrakOption');
      expect(options[0].id).toBeDefined();
    });

    it('should increment sort_order for each new option', async () => {
      await upsertEntitiesAndOptions(models, [
        {
          options_created: [
            { id: generateId(), value: 'Option A', option_set_id: optionSet.id },
            { id: generateId(), value: 'Option B', option_set_id: optionSet.id },
            { id: generateId(), value: 'Option C', option_set_id: optionSet.id },
          ],
        },
      ]);

      const options = await models.option.find(
        { option_set_id: optionSet.id },
        { sort: ['sort_order ASC'] },
      );
      expect(options).toHaveLength(3);
      expect(options[0].sort_order).toBe(1);
      expect(options[1].sort_order).toBe(2);
      expect(options[2].sort_order).toBe(3);
    });

    it('should only have one option record after multiple pushes of the same value', async () => {
      for (let i = 0; i < 3; i++) {
        await upsertEntitiesAndOptions(models, [
          {
            options_created: [
              {
                id: generateId(),
                value: 'Duplicate Test',
                option_set_id: optionSet.id,
              },
            ],
          },
        ]);
      }

      const options = await models.option.find({
        option_set_id: optionSet.id,
        value: 'Duplicate Test',
      });
      expect(options).toHaveLength(1);
    });
  });
});
