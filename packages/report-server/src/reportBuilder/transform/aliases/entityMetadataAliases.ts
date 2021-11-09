/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { Context } from '../../context';
import { Row } from '../../types';

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
  transform: (context: Context) => (rows: Row[]) => {
    const { facilityCountByOrgUnit } = context;

    if (facilityCountByOrgUnit === undefined) {
      throw new Error(
        "Missing dependency 'facilityCountByOrgUnit' required by 'insertNumberOfFacilitiesColumn'",
      );
    }

    return rows.map(row => {
      const { organisationUnit, ...restOfRow } = row;

      if (typeof organisationUnit !== 'string') {
        throw new Error(
          `'organisationUnit' type must be string, but got: ${typeof organisationUnit}`,
        );
      }

      return {
        numberOfFacilities: facilityCountByOrgUnit[organisationUnit],
        organisationUnit,
        ...restOfRow,
      };
    });
  },
  dependencies: ['facilityCountByOrgUnit'],
};
