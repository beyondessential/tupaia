/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { buildOutput } from '../../../reportBuilder/output';
import { MULTIPLE_TRANSFORMED_DATA } from './output.fixtures';

describe('output', () => {
  describe('matrix', () => {
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
        matrix: {
          categoryField: 'InfrastructureType',
          rowField: 'FacilityType',
        },
      });
      expect(output(MULTIPLE_TRANSFORMED_DATA)).toEqual(expectedData);
    });

    it("throw error when columns is not '*' or string array", () => {
      const output = buildOutput({
        matrix: {
          categoryField: 'InfrastructureType',
          rowField: 'FacilityType',
          columns: 1,
        },
      });
      expect(() => {
        output(MULTIPLE_TRANSFORMED_DATA);
      }).toThrow();
    });

    it('can perform with categoryField', () => {
      const output = buildOutput({
        matrix: {
          categoryField: 'InfrastructureType',
          rowField: 'FacilityType',
          columns: '*',
        },
      });
      expect(output(MULTIPLE_TRANSFORMED_DATA)).toEqual(expectedData);
    });
    // TODO: it('can perform with subCategoryField', () =>{})
  });
});
