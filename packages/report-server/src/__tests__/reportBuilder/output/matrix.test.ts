/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { ReportServerAggregator } from '../../../aggregator';
import { buildOutput } from '../../../reportBuilder/output';
import { TransformTable } from '../../../reportBuilder/transform';
import {
  MULTIPLE_TRANSFORMED_DATA,
  MULTIPLE_TRANSFORMED_DATA_WITH_CATEGORIES,
  MULTIPLE_TRANSFORMED_DATA_FOR_SPECIFIED_COLUMNS,
} from './output.fixtures';

describe('matrix', () => {
  let reportServerAggregator: ReportServerAggregator; // matrix doesn't need aggregator to generate data

  describe('columns', () => {
    it("throw error when columns is not '*' or string array", async () => {
      const output = buildOutput(
        {
          type: 'matrix',
          categoryField: 'InfrastructureType',
          rowField: 'FacilityType',
          columns: 1,
        },
        {},
        reportServerAggregator,
      );

      const outputFn = async () => {
        await output(new TransformTable());
      };

      await expect(outputFn()).rejects.toThrow("columns must be either '*' or an array");
    });

    it('defaults to all columns if no columns are unspecified', async () => {
      const expectedData = {
        columns: [
          {
            key: 'Laos',
            title: 'Laos',
          },
          {
            key: 'Tonga',
            title: 'Tonga',
          },
        ],
        rows: [
          {
            categoryId: 'medical center',
            dataElement: 'hospital',
            Laos: 3,
            Tonga: 0,
          },
          {
            categoryId: 'medical center',
            dataElement: 'clinic',
            Laos: 4,
            Tonga: 9,
          },
          {
            categoryId: 'others',
            dataElement: 'park',
            Laos: 2,
            Tonga: 0,
          },
          {
            categoryId: 'others',
            dataElement: 'library',
            Laos: 0,
            Tonga: 5,
          },
          {
            category: 'medical center',
          },
          {
            category: 'others',
          },
        ],
      };
      const output = buildOutput(
        {
          type: 'matrix',
          categoryField: 'InfrastructureType',
          rowField: 'FacilityType',
        },
        {},
        reportServerAggregator,
      );
      const result = await output(
        TransformTable.fromRows(MULTIPLE_TRANSFORMED_DATA_WITH_CATEGORIES),
      );
      expect(result).toEqual(expectedData);
    });

    it("treats '*' as all columns", async () => {
      const expectedData = {
        columns: [
          {
            key: 'Laos',
            title: 'Laos',
          },
          {
            key: 'Tonga',
            title: 'Tonga',
          },
        ],
        rows: [
          {
            categoryId: 'medical center',
            dataElement: 'hospital',
            Laos: 3,
            Tonga: 0,
          },
          {
            categoryId: 'medical center',
            dataElement: 'clinic',
            Laos: 4,
            Tonga: 9,
          },
          {
            categoryId: 'others',
            dataElement: 'park',
            Laos: 2,
            Tonga: 0,
          },
          {
            categoryId: 'others',
            dataElement: 'library',
            Laos: 0,
            Tonga: 5,
          },
          {
            category: 'medical center',
          },
          {
            category: 'others',
          },
        ],
      };
      const output = buildOutput(
        {
          type: 'matrix',
          categoryField: 'InfrastructureType',
          rowField: 'FacilityType',
          columns: '*',
        },
        {},
        reportServerAggregator,
      );
      const result = await output(
        TransformTable.fromRows(MULTIPLE_TRANSFORMED_DATA_WITH_CATEGORIES),
      );
      expect(result).toEqual(expectedData);
    });

    it('can include just specified columns', async () => {
      const expectedData = {
        columns: [
          {
            key: 'Laos',
            title: 'Laos',
          },
        ],
        rows: [
          {
            categoryId: 'medical center',
            dataElement: 'hospital',
            Laos: 3,
          },
          {
            categoryId: 'medical center',
            dataElement: 'clinic',
            Laos: 4,
          },
          {
            category: 'medical center',
          },
        ],
      };
      const output = buildOutput(
        {
          type: 'matrix',
          categoryField: 'InfrastructureType',
          rowField: 'FacilityType',
          columns: ['Laos'],
        },
        {},
        reportServerAggregator,
      );
      const result = await output(
        TransformTable.fromRows(MULTIPLE_TRANSFORMED_DATA_FOR_SPECIFIED_COLUMNS),
      );
      expect(result).toEqual(expectedData);
    });

    it('can include dynamic and specified columns', async () => {
      const expectedData = {
        columns: [
          {
            key: 'Tonga',
            title: 'Tonga',
          },
          {
            key: 'InfrastructureType',
            title: 'InfrastructureType',
          },
          {
            key: 'Laos',
            title: 'Laos',
          },
        ],
        rows: [
          {
            dataElement: 'hospital',
            InfrastructureType: 'medical center',
            Tonga: 0,
            Laos: 3,
          },
          {
            InfrastructureType: 'medical center',
            dataElement: 'clinic',
            Tonga: 9,
            Laos: 4,
          },
          {
            InfrastructureType: 'others',
            Tonga: 0,
            dataElement: 'park',
          },
          {
            InfrastructureType: 'others',
            Tonga: 5,
            dataElement: 'library',
          },
        ],
      };
      const output = buildOutput(
        {
          type: 'matrix',
          rowField: 'FacilityType',
          columns: ['Tonga', '*', 'Laos'],
        },
        {},
        reportServerAggregator,
      );
      const result = await output(
        TransformTable.fromRows(MULTIPLE_TRANSFORMED_DATA_FOR_SPECIFIED_COLUMNS),
      );
      expect(result).toEqual(expectedData);
    });
  });

  describe('categoryField', () => {
    it('throws error if categoryField matches any columns', async () => {
      const output = buildOutput(
        {
          type: 'matrix',
          categoryField: 'InfrastructureType',
          rowField: 'FacilityType',
          columns: ['InfrastructureType', 'Laos', 'Tonga'],
        },
        {},
        reportServerAggregator,
      );
      await expect(async () => {
        await output(new TransformTable());
      }).rejects.toThrow(
        'categoryField cannot be one of: [InfrastructureType,Laos,Tonga] they are already specified as columns',
      );
    });

    it('throws error if categoryField matches rowField', async () => {
      const output = buildOutput(
        {
          type: 'matrix',
          categoryField: 'FacilityType',
          rowField: 'FacilityType',
        },
        {},
        reportServerAggregator,
      );
      await expect(async () => {
        await output(new TransformTable());
      }).rejects.toThrow(
        'rowField cannot be: FacilityType, it is already specified as categoryField',
      );
    });

    it('categoryField is not required', async () => {
      const expectedData = {
        columns: [
          {
            key: 'Laos',
            title: 'Laos',
          },
          {
            key: 'Tonga',
            title: 'Tonga',
          },
        ],
        rows: [
          {
            dataElement: 'hospital',
            Laos: 3,
            Tonga: 0,
          },
          {
            dataElement: 'clinic',
            Laos: 4,
            Tonga: 9,
          },
          {
            dataElement: 'park',
            Laos: 2,
            Tonga: 0,
          },
          {
            dataElement: 'library',
            Laos: 0,
            Tonga: 5,
          },
        ],
      };
      const output = buildOutput(
        {
          type: 'matrix',
          rowField: 'FacilityType',
        },
        {},
        reportServerAggregator,
      );
      const result = await output(TransformTable.fromRows(MULTIPLE_TRANSFORMED_DATA));
      expect(result).toEqual(expectedData);
    });

    it('categorizes rows by categoryField', async () => {
      const expectedData = {
        columns: [
          {
            key: 'Laos',
            title: 'Laos',
          },
          {
            key: 'Tonga',
            title: 'Tonga',
          },
        ],
        rows: [
          {
            categoryId: 'medical center',
            dataElement: 'hospital',
            Laos: 3,
            Tonga: 0,
          },
          {
            categoryId: 'medical center',
            dataElement: 'clinic',
            Laos: 4,
            Tonga: 9,
          },
          {
            categoryId: 'others',
            dataElement: 'park',
            Laos: 2,
            Tonga: 0,
          },
          {
            categoryId: 'others',
            dataElement: 'library',
            Laos: 0,
            Tonga: 5,
          },
          {
            category: 'medical center',
          },
          {
            category: 'others',
          },
        ],
      };
      const output = buildOutput(
        {
          type: 'matrix',
          categoryField: 'InfrastructureType',
          rowField: 'FacilityType',
          columns: '*',
        },
        {},
        reportServerAggregator,
      );
      const result = await output(
        TransformTable.fromRows(MULTIPLE_TRANSFORMED_DATA_WITH_CATEGORIES),
      );
      expect(result).toEqual(expectedData);
    });
  });

  describe('rowField', () => {
    it('throws error if rowField matches any columns', async () => {
      const output = buildOutput(
        {
          type: 'matrix',
          categoryField: 'InfrastructureType',
          rowField: 'FacilityType',
          columns: ['FacilityType', 'Laos', 'Tonga'],
        },
        {},
        reportServerAggregator,
      );
      await expect(async () => {
        await output(new TransformTable());
      }).rejects.toThrow(
        'rowField cannot be one of: [FacilityType,Laos,Tonga] they are already specified as columns',
      );
    });

    it('throws error if rowField matches categoryField', async () => {
      const output = buildOutput(
        {
          type: 'matrix',
          categoryField: 'FacilityType',
          rowField: 'FacilityType',
        },
        {},
        reportServerAggregator,
      );
      await expect(async () => {
        await output(new TransformTable());
      }).rejects.toThrow(
        'rowField cannot be: FacilityType, it is already specified as categoryField',
      );
    });

    it('throws error if rowField not provided ', async () => {
      const output = buildOutput(
        {
          type: 'matrix',
          categoryField: 'FacilityType',
        },
        {},
        reportServerAggregator,
      );
      await expect(async () => {
        await output(new TransformTable());
      }).rejects.toThrow('rowField is a required field');
    });

    it('names rows by rowField', async () => {
      const expectedData = {
        columns: [
          {
            key: 'InfrastructureType',
            title: 'InfrastructureType',
          },
          {
            key: 'Laos',
            title: 'Laos',
          },
          {
            key: 'Tonga',
            title: 'Tonga',
          },
        ],
        rows: [
          {
            InfrastructureType: 'medical center',
            dataElement: 'hospital',
            Laos: 3,
            Tonga: 0,
          },
          {
            InfrastructureType: 'medical center',
            dataElement: 'clinic',
            Laos: 4,
            Tonga: 9,
          },
          {
            InfrastructureType: 'others',
            dataElement: 'park',
            Laos: 2,
            Tonga: 0,
          },
          {
            InfrastructureType: 'others',
            dataElement: 'library',
            Laos: 0,
            Tonga: 5,
          },
        ],
      };
      const output = buildOutput(
        {
          type: 'matrix',
          rowField: 'FacilityType',
        },
        {},
        reportServerAggregator,
      );
      const result = await output(
        TransformTable.fromRows(MULTIPLE_TRANSFORMED_DATA_WITH_CATEGORIES),
      );
      expect(result).toEqual(expectedData);
    });
  });
});
