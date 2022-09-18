/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { Context } from '../../context';
import { TransformTable } from '../table';

/**
 * [
 *  { organisationUnit: 'TO' },
 *  { organisationUnit: 'PG' }
 * ]
 *  =>
 * [
 *  { organisationUnit: 'TO', numberOfFacilities: 14 },
 *  { organisationUnit: 'PG', numberOfFacilities: 9 }
 * ]
 */
export const insertNumberOfFacilitiesColumn = {
  transform: (context: Context) => (table: TransformTable) => {
    const { facilityCountByOrgUnit } = context;

    if (facilityCountByOrgUnit === undefined) {
      throw new Error(
        "Missing dependency 'facilityCountByOrgUnit' required by 'insertNumberOfFacilitiesColumn'",
      );
    }

    const organisationUnitValues = table.getColumnValues('organisationUnit');
    const numberOfFacilitiesColumnValues = organisationUnitValues.map(organisationUnit => {
      if (typeof organisationUnit !== 'string') {
        throw new Error(
          `'organisationUnit' type must be string, but got: ${typeof organisationUnit}`,
        );
      }

      return facilityCountByOrgUnit[organisationUnit];
    });

    return table.upsertColumns([
      {
        columnName: 'numberOfFacilities',
        values: numberOfFacilitiesColumnValues,
      },
    ]);
  },
  dependencies: ['facilityCountByOrgUnit'],
};
