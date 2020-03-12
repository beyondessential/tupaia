/**
 * Tupaia Config Server
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import { getDhisApiInstance } from '../getDhisApiInstance';

export const getDhisApiInstanceForChange = ({ details }) => {
  const { isDataRegional, organisationUnitCode } = details;
  return getDhisApiInstance({ entityCode: organisationUnitCode, isDataRegional });
};
