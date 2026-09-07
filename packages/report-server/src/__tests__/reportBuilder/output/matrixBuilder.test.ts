import { TransformTable } from '../../../reportBuilder/transform';
import { MatrixBuilder } from '../../../reportBuilder/output/functions/matrix/matrixBuilder';
import { MatrixParams } from '../../../reportBuilder/output/functions/matrix/types';
import {
  MULTIPLE_TRANSFORMED_DATA,
  MULTIPLE_TRANSFORMED_DATA_WITH_CATEGORIES,
  MULTIPLE_TRANSFORMED_DATA_FOR_SPECIFIED_COLUMNS,
} from './output.fixtures';

const buildMatrix = (rows: Record<string, unknown>[], params: MatrixParams) =>
  new MatrixBuilder(TransformTable.fromRows(rows), params).build();

describe('MatrixBuilder', () => {
  describe('column selection', () => {
    it('uses explicit string columns', () => {
      const result = buildMatrix(MULTIPLE_TRANSFORMED_DATA, {
        columns: { includeFields: ['Laos'], excludeFields: ['FacilityType'] },
        rows: { rowField: 'FacilityType', categoryField: undefined },
      });

      expect(result.columns).toEqual([{ key: 'Laos', title: 'Laos' }]);
    });

    it('expands "*" to remaining table columns minus excluded fields', () => {
      const result = buildMatrix(MULTIPLE_TRANSFORMED_DATA_WITH_CATEGORIES, {
        columns: {
          includeFields: ['*'],
          excludeFields: ['InfrastructureType', 'FacilityType'],
        },
        rows: { rowField: 'FacilityType', categoryField: 'InfrastructureType' },
      });

      expect(result.columns).toEqual([
        { key: 'Laos', title: 'Laos' },
        { key: 'Tonga', title: 'Tonga' },
      ]);
    });

    it('formats MatrixEntityCell columns that exist in the table', () => {
      const result = buildMatrix(MULTIPLE_TRANSFORMED_DATA_FOR_SPECIFIED_COLUMNS, {
        columns: {
          includeFields: [{ entityLabel: 'Tonga', entityCode: 'TO' }, 'Laos'],
          excludeFields: ['FacilityType'],
        },
        rows: { rowField: 'FacilityType', categoryField: 'InfrastructureType' },
      });

      expect(result.columns).toEqual([
        { key: 'Tonga', title: 'Tonga', entityCode: 'TO' },
        { key: 'Laos', title: 'Laos' },
      ]);
    });

    it('drops MatrixEntityCell columns that are not present in the table', () => {
      const result = buildMatrix(MULTIPLE_TRANSFORMED_DATA, {
        columns: {
          includeFields: [{ entityLabel: 'Missing', entityCode: 'XX' }, 'Laos'],
          excludeFields: ['FacilityType'],
        },
        rows: { rowField: 'FacilityType', categoryField: undefined },
      });

      expect(result.columns).toEqual([{ key: 'Laos', title: 'Laos' }]);
    });

    it('combines a fixed entity column with "*" for the remaining columns', () => {
      const result = buildMatrix(MULTIPLE_TRANSFORMED_DATA_FOR_SPECIFIED_COLUMNS, {
        columns: {
          includeFields: [{ entityLabel: 'Tonga', entityCode: 'TO' }, '*'],
          excludeFields: ['FacilityType'],
        },
        rows: { rowField: 'FacilityType', categoryField: 'InfrastructureType' },
      });

      expect(result.columns).toEqual([
        { key: 'Tonga', title: 'Tonga', entityCode: 'TO' },
        { key: 'InfrastructureType', title: 'InfrastructureType' },
        { key: 'Laos', title: 'Laos' },
      ]);
    });
  });

  describe('rows', () => {
    it('maps the row field without a category field', () => {
      const result = buildMatrix(MULTIPLE_TRANSFORMED_DATA, {
        columns: { includeFields: ['*'], excludeFields: ['FacilityType'] },
        rows: { rowField: 'FacilityType', categoryField: undefined },
      });

      expect(result.rows.slice(0, 2)).toEqual([
        { dataElement: 'hospital', Laos: 3, Tonga: 0 },
        { dataElement: 'clinic', Laos: 4, Tonga: 9 },
      ]);
      expect(result.rows.some(row => 'category' in row)).toBe(false);
    });

    it('maps row and category fields and appends category summary rows', () => {
      const result = buildMatrix(MULTIPLE_TRANSFORMED_DATA_WITH_CATEGORIES, {
        columns: { includeFields: ['*'], excludeFields: ['FacilityType', 'InfrastructureType'] },
        rows: { rowField: 'FacilityType', categoryField: 'InfrastructureType' },
      });

      expect(result.rows).toContainEqual({
        categoryId: 'medical center',
        dataElement: 'hospital',
        Laos: 3,
        Tonga: 0,
      });
      expect(result.rows).toContainEqual({ category: 'medical center' });
      expect(result.rows).toContainEqual({ category: 'others' });
    });

    it('filters row data to selected columns and drops rows with no column values', () => {
      const result = buildMatrix(MULTIPLE_TRANSFORMED_DATA_FOR_SPECIFIED_COLUMNS, {
        columns: { includeFields: ['Laos'], excludeFields: ['FacilityType', 'InfrastructureType'] },
        rows: { rowField: 'FacilityType', categoryField: 'InfrastructureType' },
      });

      expect(result.rows).toEqual([
        { categoryId: 'medical center', dataElement: 'hospital', Laos: 3 },
        { categoryId: 'medical center', dataElement: 'clinic', Laos: 4 },
        { category: 'medical center' },
        { category: 'others' },
      ]);
    });

    it('keeps all row fields when "*" is included in column selection', () => {
      const result = buildMatrix(MULTIPLE_TRANSFORMED_DATA_FOR_SPECIFIED_COLUMNS, {
        columns: {
          includeFields: ['*'],
          excludeFields: ['FacilityType', 'InfrastructureType'],
        },
        rows: { rowField: 'FacilityType', categoryField: 'InfrastructureType' },
      });

      expect(result.rows[0]).toEqual({
        categoryId: 'medical center',
        dataElement: 'hospital',
        Laos: 3,
        Tonga: 0,
      });
    });
  });
});
