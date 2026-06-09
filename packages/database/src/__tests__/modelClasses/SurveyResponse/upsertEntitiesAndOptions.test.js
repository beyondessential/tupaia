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

      const [firstOption] = await models.option.find({ option_set_id: optionSet.id, value: 'PM-900' });
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

      const options = await models.option.find({ option_set_id: optionSet.id, value: 'DatatrakOption' });
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
