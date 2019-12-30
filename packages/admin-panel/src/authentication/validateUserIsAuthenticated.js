/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

export const validateUserIsAuthenticated = ({ permissionGroups }) =>
  !!permissionGroups && !!permissionGroups['No Country'];
