/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import { createModelsStub } from '@tupaia/database';
import { DataServiceMapping } from '../../../services/DataServiceMapping';
import {
  pullDataElementMetadataFromTupaiaSurveys,
  pullDataGroupMetadataFromTupaiaSurveys,
} from '../../../services/utils';
import { DataBrokerModelRegistry } from '../../../types';
import { OPTIONS, QUESTIONS, SURVEYS } from './pullMetadataFromTupaiaSurveys.fixtures';

describe('pullMetadataFromTupaiaSurveys', () => {
  const models = createModelsStub({
    question: { records: QUESTIONS },
    survey: { records: SURVEYS },
    option: { records: OPTIONS },
    dataGroup: {
      records: [],
      extraMethods: {
        getDataElementsInDataGroup: (dataGroupCode: string) =>
          SURVEYS.find(({ code }) => code === dataGroupCode)?.questions || [],
      },
    },
  }) as DataBrokerModelRegistry;

  describe('pullDataElementMetadataFromTupaiaSurveys', () => {
    it('throws an error with invalid parameters', async () => {
      await expect(
        pullDataElementMetadataFromTupaiaSurveys(models, [], {
          dataServiceMapping: new DataServiceMapping(),
        }),
      ).toBeRejectedWith(/data element codes/);
    });

    it('returns a single data element in the correct format', async () => {
      await expect(
        pullDataElementMetadataFromTupaiaSurveys(
          models,
          [{ code: 'BCD1TEST', service_type: 'tupaia', config: {} }],
          {
            dataServiceMapping: new DataServiceMapping(),
            includeOptions: false,
          },
        ),
      ).resolves.toStrictEqual([
        {
          code: 'BCD1TEST',
          name: 'Facility Status',
        },
      ]);
    });

    it('returns a single data element with options metadata included', async () => {
      expect(
        await pullDataElementMetadataFromTupaiaSurveys(
          models,
          [{ code: 'BCD57TEST', service_type: 'tupaia', config: {} }],
          {
            dataServiceMapping: new DataServiceMapping(),
            includeOptions: true,
          },
        ),
      ).toStrictEqual([
        {
          code: 'BCD57TEST',
          name: 'Foundation',
          options: {
            'Concrete slab': 'Concrete slab',
            'Concrete stumps': 'Concrete stumps',
            'Timber stumps': 'Timber stumps',
            'Timber on ground': 'Timber on ground',
            Earth: 'Earth',
            Other: 'Other',
          },
        },
      ]);
    });

    it('returns a single data element with options label/value metadata included', async () => {
      expect(
        await pullDataElementMetadataFromTupaiaSurveys(
          models,
          [{ code: 'BCD902TEST', service_type: 'tupaia', config: {} }],
          {
            dataServiceMapping: new DataServiceMapping(),
            includeOptions: true,
          },
        ),
      ).toStrictEqual([
        {
          code: 'BCD902TEST',
          name: 'Terrain',
          options: {
            rock: 'Rocky terrain',
            sea: 'The Ocean',
            Fire: 'Fire',
            Space: 'Space',
            Earth: 'Earth',
            Other: 'Other',
          },
        },
      ]);
    });

    it('returns a single data element with options set metadata included', async () => {
      expect(
        await pullDataElementMetadataFromTupaiaSurveys(
          models,
          [{ code: 'KITTY_1', service_type: 'tupaia', config: {} }],
          {
            dataServiceMapping: new DataServiceMapping(),
            includeOptions: true,
          },
        ),
      ).toStrictEqual([
        {
          code: 'KITTY_1',
          name: 'Which cat?',
          options: {
            Momo: "Rohan's cat",
            Ramen: "Biao's cat",
          },
        },
      ]);
    });

    it('returns multiple data elements in the correct format', async () => {
      expect(
        await pullDataElementMetadataFromTupaiaSurveys(
          models,
          [
            { code: 'BCD1TEST', service_type: 'tupaia', config: {} },
            { code: 'BCD57TEST', service_type: 'tupaia', config: {} },
            { code: 'CROP_1', service_type: 'tupaia', config: {} },
            { code: 'CROP_2', service_type: 'tupaia', config: {} },
          ],
          {
            dataServiceMapping: new DataServiceMapping(),
            includeOptions: false,
          },
        ),
      ).toIncludeSameMembers([
        {
          code: 'BCD1TEST',
          name: 'Facility Status',
        },
        {
          code: 'BCD57TEST',
          name: 'Foundation',
        },
        {
          code: 'CROP_1',
          name: 'Number of potatoes grown',
        },
        {
          code: 'CROP_2',
          name: 'Number of lettuces grown',
        },
      ]);
    });

    it('returns multiple data elements with options metadata included', async () => {
      expect(
        await pullDataElementMetadataFromTupaiaSurveys(
          models,
          [
            { code: 'BCD1TEST', service_type: 'tupaia', config: {} },
            { code: 'BCD57TEST', service_type: 'tupaia', config: {} },
            { code: 'CROP_1', service_type: 'tupaia', config: {} },
            { code: 'CROP_2', service_type: 'tupaia', config: {} },
          ],
          {
            dataServiceMapping: new DataServiceMapping(),
            includeOptions: true,
          },
        ),
      ).toIncludeSameMembers([
        {
          code: 'BCD1TEST',
          name: 'Facility Status',
        },
        {
          code: 'BCD57TEST',
          name: 'Foundation',
          options: {
            'Concrete slab': 'Concrete slab',
            'Concrete stumps': 'Concrete stumps',
            'Timber stumps': 'Timber stumps',
            'Timber on ground': 'Timber on ground',
            Earth: 'Earth',
            Other: 'Other',
          },
        },
        {
          code: 'CROP_1',
          name: 'Number of potatoes grown',
        },
        {
          code: 'CROP_2',
          name: 'Number of lettuces grown',
        },
      ]);
    });
  });

  describe('pullDataGroupMetadataFromTupaiaSurveys', () => {
    it('throws an error with invalid parameters', async () => {
      await expect(
        pullDataGroupMetadataFromTupaiaSurveys(models, [], {
          dataServiceMapping: new DataServiceMapping(),
        }),
      ).toBeRejectedWith(/data group code/);
    });

    it('returns a just the data group if the survey has no questions', async () => {
      await expect(
        pullDataGroupMetadataFromTupaiaSurveys(
          models,
          [{ code: 'EMPTY', service_type: 'tupaia', config: {} }],
          {
            dataServiceMapping: new DataServiceMapping(),
          },
        ),
      ).resolves.toStrictEqual({
        code: 'EMPTY',
        name: 'Empty Survey',
      });
    });

    it('returns a single data group with data element metadata', async () => {
      await expect(
        pullDataGroupMetadataFromTupaiaSurveys(
          models,
          [{ code: 'BCDTEST', service_type: 'tupaia', config: {} }],
          {
            dataServiceMapping: new DataServiceMapping(),
            includeOptions: false,
          },
        ),
      ).resolves.toStrictEqual({
        code: 'BCDTEST',
        name: 'Basic Clinic Data Test',
        dataElements: [
          { code: 'BCD1TEST', name: 'Facility Status' },
          { code: 'BCD325TEST', name: 'Days of operation' },
          { code: 'BCD57TEST', name: 'Foundation' },
          { code: 'BCD902TEST', name: 'Terrain' },
        ],
      });
    });

    it('returns a single data group metadata with data element options included', async () => {
      expect(
        await pullDataGroupMetadataFromTupaiaSurveys(
          models,
          [{ code: 'BCDTEST', service_type: 'tupaia', config: {} }],
          {
            dataServiceMapping: new DataServiceMapping(),
            includeOptions: true,
          },
        ),
      ).toStrictEqual({
        code: 'BCDTEST',
        name: 'Basic Clinic Data Test',
        dataElements: [
          { code: 'BCD1TEST', name: 'Facility Status' },
          { code: 'BCD325TEST', name: 'Days of operation' },
          {
            code: 'BCD57TEST',
            name: 'Foundation',
            options: {
              'Concrete slab': 'Concrete slab',
              'Concrete stumps': 'Concrete stumps',
              Earth: 'Earth',
              Other: 'Other',
              'Timber on ground': 'Timber on ground',
              'Timber stumps': 'Timber stumps',
            },
          },
          {
            code: 'BCD902TEST',
            name: 'Terrain',
            options: {
              Earth: 'Earth',
              Fire: 'Fire',
              Other: 'Other',
              Space: 'Space',
              rock: 'Rocky terrain',
              sea: 'The Ocean',
            },
          },
        ],
      });
    });

    it('returns a single data group metadata with data element options set included', async () => {
      expect(
        await pullDataGroupMetadataFromTupaiaSurveys(
          models,
          [{ code: 'KITTY', service_type: 'tupaia', config: {} }],
          {
            dataServiceMapping: new DataServiceMapping(),
            includeOptions: true,
          },
        ),
      ).toStrictEqual({
        code: 'KITTY',
        name: 'Cat assessment',
        dataElements: [
          {
            code: 'KITTY_1',
            name: 'Which cat?',
            options: { Momo: "Rohan's cat", Ramen: "Biao's cat" },
          },
          { code: 'KITTY_2', name: 'Number of hours slept' },
        ],
      });
    });
  });
});
