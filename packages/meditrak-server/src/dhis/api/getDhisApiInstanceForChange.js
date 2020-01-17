/**
 * Tupaia Config Server
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import dataBroker from '@tupaia/data-broker';

export const getDhisApiInstanceForChange = ({ details }) => {
  const { isDataRegional, organisationUnitCode } = details;
  return dataBroker.getDhisApiInstance({ entityCode: organisationUnitCode, isDataRegional });
};
