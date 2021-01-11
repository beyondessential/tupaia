/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

export const isParameterCode = (parameters: { code: string }[], code: string) =>
  !!parameters.find(p => p.code === code);
