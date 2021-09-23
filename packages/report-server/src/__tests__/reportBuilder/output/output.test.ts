/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { buildOutput } from '../../../reportBuilder/output';
import {
  MULTIPLE_TRANSFORMED_DATA,
  MULTIPLE_TRANSFORMED_DATA_WITH_CATEGORIES,
  MULTIPLE_TRANSFORMED_DATA_FOR_SPECIFIED_COLUMNS,
} from './output.fixtures';

describe('output', () => {
  describe('matrix', () => {
    describe('handle columns', () => {
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

      it('can perform without columns', () => {
        const output = buildOutput({
          type: 'matrix',
          categoryField: 'InfrastructureType',
          rowField: 'FacilityType',
        });
        expect(output(MULTIPLE_TRANSFORMED_DATA_WITH_CATEGORIES)).toEqual(expectedData);
      });

      it("throw error when columns is not '*' or string array", () => {
        const output = buildOutput({
          type: 'matrix',
          categoryField: 'InfrastructureType',
          rowField: 'FacilityType',
          columns: 1,
        });
        expect(() => {
          output(MULTIPLE_TRANSFORMED_DATA_WITH_CATEGORIES);
        }).toThrow();
      });

      it('can return only specified columns', () => {
        const expectedDataForThisCase = {
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
        const output = buildOutput({
          type: 'matrix',
          categoryField: 'InfrastructureType',
          rowField: 'FacilityType',
          columns: ['Laos'],
        });
        expect(output(MULTIPLE_TRANSFORMED_DATA_FOR_SPECIFIED_COLUMNS)).toEqual(
          expectedDataForThisCase,
        );
      });
    });

    describe('handle categoryField', () => {
      it('throws error if categoryField matches any columns', () => {
        const output = buildOutput({
          type: 'matrix',
          categoryField: 'InfrastructureType',
          rowField: 'FacilityType',
          columns: ['InfrastructureType', 'Laos', 'Tonga'],
        });
        expect(() => {
          output(MULTIPLE_TRANSFORMED_DATA_WITH_CATEGORIES);
        }).toThrow();
      });

      it('throws error if categoryField matches rowField', () => {
        const output = buildOutput({
          type: 'matrix',
          categoryField: 'FacilityType',
          rowField: 'FacilityType',
        });
        expect(() => {
          output(MULTIPLE_TRANSFORMED_DATA_WITH_CATEGORIES);
        }).toThrow();
      });

      it('can perform with categoryField', () => {
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
        const output = buildOutput({
          type: 'matrix',
          categoryField: 'InfrastructureType',
          rowField: 'FacilityType',
          columns: '*',
        });
        expect(output(MULTIPLE_TRANSFORMED_DATA_WITH_CATEGORIES)).toEqual(expectedData);
      });

      it('perform with no categoryField', () => {
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
        const output = buildOutput({
          type: 'matrix',
          rowField: 'FacilityType',
        });
        expect(output(MULTIPLE_TRANSFORMED_DATA)).toEqual(expectedData);
      });
    });

    describe('handle rowField', () => {
      it('throws error if rowField matches any columns', () => {
        const output = buildOutput({
          type: 'matrix',
          categoryField: 'InfrastructureType',
          rowField: 'FacilityType',
          columns: ['FacilityType', 'Laos', 'Tonga'],
        });
        expect(() => {
          output(MULTIPLE_TRANSFORMED_DATA_WITH_CATEGORIES);
        }).toThrow();
      });

      it('throws error if rowField matches categoryField', () => {
        const output = buildOutput({
          type: 'matrix',
          categoryField: 'FacilityType',
          rowField: 'FacilityType',
        });
        expect(() => {
          output(MULTIPLE_TRANSFORMED_DATA_WITH_CATEGORIES);
        }).toThrow();
      });

      it('throws error if rowField not provided ', () => {
        const output = buildOutput({
          type: 'matrix',
          categoryField: 'FacilityType',
        });
        expect(() => {
          output(MULTIPLE_TRANSFORMED_DATA_WITH_CATEGORIES);
        }).toThrow();
      });

      it('can perform with rowField', () => {
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
        const output = buildOutput({
          type: 'matrix',
          rowField: 'FacilityType',
        });
        expect(output(MULTIPLE_TRANSFORMED_DATA_WITH_CATEGORIES)).toEqual(expectedData);
      });
    });
  });
});
