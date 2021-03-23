/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import { generatePath } from 'react-router-dom';

export const makeEntityLink = (organisationUnitCode, view = 'dashboard') =>
  generatePath('/:organisationUnitCode/:view', {
    organisationUnitCode,
    view,
  });
