/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

type PositionParams = {
  position?: string;
};

// Calculate which position to splice a new row into an array
const positionAliases = {
  before: (index: number, insertCount: number) => index + insertCount,
  after: (index: number, insertCount: number) => index + insertCount + 1,
  start: (index: number, insertCount: number) => insertCount,
}

export const buildPositioner = (params: unknown) => {
  if (typeof params !== 'object' || params === null) {
    throw new Error(`Expected params object but got ${params}`);
  }

  if (!('position' in params)) {
    return positionAliases['after'];
  }

  const positionValue: unknown = params.position;

  if (typeof positionValue !== 'string' || !(positionValue in positionAliases)) {
    throw new Error(`Expected position to be one of ${Object.keys(positionAliases)} but got ${positionValue}`);
  }

  return positionAliases[positionValue as keyof typeof positionAliases];
};
