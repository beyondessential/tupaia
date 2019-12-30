/**
 * Tupaia Config Server
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

export const stripFromStart = (originalString, toStripOff = '') =>
  originalString.replace(new RegExp(`^${toStripOff}`), '').trim();
