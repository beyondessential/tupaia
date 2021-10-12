/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import { generatePath } from 'react-router-dom';

export const makeEntityLink = (lang, entityCode, view = 'dashboard') =>
  generatePath(`/:lang/:entityCode/:view`, {
    lang,
    entityCode,
    view,
  });
