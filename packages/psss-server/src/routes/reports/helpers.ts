/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

const SYNDROMES: any[] = ['AFR', 'DIA', 'DLI', 'ILI', 'PF'];

export const validateSyndrome = (syndrome: unknown) => {
  if (!SYNDROMES.includes(syndrome)) {
    throw new Error(`Invalid syndrome ${syndrome} provided, must be one of ${SYNDROMES}`);
  }
};
