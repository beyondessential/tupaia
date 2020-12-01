/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { buildTransform } from '..';

export const keyValueByDataElementName = () =>
  buildTransform([
    {
      transform: 'select',
      '$row.dataElement': '$row.value',
      '...': ['period', 'organisationUnit'],
    },
  ]);

export const keyValueByOrgUnit = () =>
  buildTransform([
    {
      transform: 'select',
      '$row.organisationUnit': '$row.value',
      '...': ['period', 'dataElement'],
    },
  ]);

export const keyValueByPeriod = () =>
  buildTransform([
    {
      transform: 'select',
      '$row.period': '$row.value',
      '...': ['dataElement', 'organisationUnit'],
    },
  ]);
