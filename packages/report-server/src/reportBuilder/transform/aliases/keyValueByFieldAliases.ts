/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { Row } from '../../types';

/**
 * { period: '20200101', organisationUnit: 'TO', dataElement: 'CH01', value: 7 }
 *  => { period: '20200101', organisationUnit: 'TO', CH01: 7 }
 */
export const keyValueByDataElementName = () => (rows: Row[]) => {
  return rows.map(row => {
    const { dataElement, value, ...restOfRow } = row;
    return { [dataElement as string]: value, ...restOfRow };
  });
};

/**
 * { period: '20200101', organisationUnit: 'TO', dataElement: 'CH01', value: 7 }
 *  => { period: '20200101', TO: 7, dataElement: 'CH01' }
 */
export const keyValueByOrgUnit = () => (rows: Row[]) => {
  return rows.map(row => {
    const { organisationUnit, value, ...restOfRow } = row;
    return { [organisationUnit as string]: value, ...restOfRow };
  });
};

/**
 * { period: '20200101', organisationUnit: 'TO', dataElement: 'CH01', value: 7 }
 *  => { 20200101: 7, organisationUnit: 'TO', dataElement: 'CH01' }
 */
export const keyValueByPeriod = () => (rows: Row[]) => {
  return rows.map(row => {
    const { period, value, ...restOfRow } = row;
    return { [period as string]: value, ...restOfRow };
  });
};
