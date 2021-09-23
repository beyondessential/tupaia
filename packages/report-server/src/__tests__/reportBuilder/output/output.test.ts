/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { buildOutput } from '../../../reportBuilder/output';
import {
  MULTIPLE_TRANSFORMED_DATA_WITH_CATEGORIES,
  MULTIPLE_TRANSFORMED_DATA_FOR_SPECIFIED_COLUMNS,
  MULTIPLE_TRANSFORMED_DATA_WITH_PERIOD,
} from './output.fixtures';

describe('output', () => {
  describe('matrix', () => {
    describe('handle columns', () => {
      it("throw error when columns is not '*' or string array", () => {
        const output = buildOutput({
          type: 'matrix',
          categoryField: 'InfrastructureType',
          rowField: 'FacilityType',
          columns: 1,
        });
        expect(() => {
          output({ results: [] });
        }).toThrow("columns must be either '*' or an array");
      });

      it('can perform without columns', () => {
        const expectedData = {
          results: {
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
          },
        };
        const output = buildOutput({
          type: 'matrix',
          categoryField: 'InfrastructureType',
          rowField: 'FacilityType',
        });
        expect(output(MULTIPLE_TRANSFORMED_DATA_WITH_CATEGORIES)).toEqual(expectedData);
      });

      it('can return only specified columns', () => {
        const expectedDataForThisCase = {
          results: {
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
          },
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
          output({ results: [] });
        }).toThrow(
          'categoryField cannot be one of: [InfrastructureType,Laos,Tonga] they are already specified as columns',
        );
      });

      it('throws error if categoryField matches rowField', () => {
        const output = buildOutput({
          type: 'matrix',
          categoryField: 'FacilityType',
          rowField: 'FacilityType',
        });
        expect(() => {
          output({ results: [] });
        }).toThrow('rowField cannot be: FacilityType, it is already specified as categoryField');
      });

      it('can perform with categoryField', () => {
        const expectedData = {
          results: {
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
          },
        };

        const output = buildOutput({
          type: 'matrix',
          categoryField: 'InfrastructureType',
          rowField: 'FacilityType',
        });
        expect(output(MULTIPLE_TRANSFORMED_DATA_WITH_CATEGORIES)).toEqual(expectedData);
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
          output({ results: [] });
        }).toThrow(
          'rowField cannot be one of: [FacilityType,Laos,Tonga] they are already specified as columns',
        );
      });

      it('throws error if rowField matches categoryField', () => {
        const output = buildOutput({
          type: 'matrix',
          categoryField: 'FacilityType',
          rowField: 'FacilityType',
        });
        expect(() => {
          output({ results: [] });
        }).toThrow('rowField cannot be: FacilityType, it is already specified as categoryField');
      });

      it('throws error if rowField not provided ', () => {
        const output = buildOutput({
          type: 'matrix',
          categoryField: 'FacilityType',
        });
        expect(() => {
          output({ results: [] });
        }).toThrow('rowField is a required field');
      });

      it('can perform with rowField', () => {
        const expectedData = {
          results: {
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
          },
        };
        const output = buildOutput({
          type: 'matrix',
          rowField: 'FacilityType',
        });
        expect(output(MULTIPLE_TRANSFORMED_DATA_WITH_CATEGORIES)).toEqual(expectedData);
      });
    });

    it('adds earliest and latest periods', () => {
      const expectedData = {
        results: {
          columns: [
            {
              key: 'period',
              title: 'period',
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
              period: '20210920',
              dataElement: 'hospital',
              Laos: 3,
              Tonga: 0,
            },
            {
              period: '20210921',
              dataElement: 'clinic',
              Laos: 4,
              Tonga: 9,
            },
            {
              period: '20210922',
              dataElement: 'park',
              Laos: 2,
              Tonga: 0,
            },
            {
              period: '20210923',
              dataElement: 'library',
              Laos: 0,
              Tonga: 5,
            },
          ],
        },
        period: {
          requested: '20210919;20210920;20210921;20210922;20210923;20210924',
          earliestAvailable: '20210920',
          latestAvailable: '20210923',
          reportStart: '20210920',
          reportEnd: '20210923',
        },
      };
      const output = buildOutput({
        type: 'matrix',
        rowField: 'FacilityType',
      });
      expect(output(MULTIPLE_TRANSFORMED_DATA_WITH_PERIOD)).toEqual(expectedData);
    });

    it('can exclude certain fields', () => {
      const expectedData = {
        results: {
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
        },
        period: {
          requested: '20210919;20210920;20210921;20210922;20210923;20210924',
          earliestAvailable: '20210920',
          latestAvailable: '20210923',
          reportStart: '20210920',
          reportEnd: '20210923',
        },
      };
      const output = buildOutput({
        type: 'matrix',
        rowField: 'FacilityType',
        excludeFields: ['period'],
      });
      expect(output(MULTIPLE_TRANSFORMED_DATA_WITH_PERIOD)).toEqual(expectedData);
    });
  });
});
