/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import { generatePath } from 'react-router-dom';

export const makeEntityLink = (locale, entityCode, view = 'dashboard') =>
  generatePath(`/:locale/:entityCode/:view`, {
    locale,
    entityCode,
    view,
  });
