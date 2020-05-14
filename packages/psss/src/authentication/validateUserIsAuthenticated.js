/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

export const validateUserIsAuthenticated = ({ permissionGroups }) =>
  !!permissionGroups && !!permissionGroups['No Country'];
