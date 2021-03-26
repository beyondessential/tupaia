/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import { generatePath } from 'react-router-dom';

export const makeEntityLink = (entityCode, view = 'dashboard') =>
  generatePath('/:entityCode/:view', {
    entityCode,
    view,
  });
