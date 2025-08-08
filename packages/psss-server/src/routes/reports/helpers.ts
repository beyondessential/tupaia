import { SYNDROMES } from '../../constants';

export const validateSyndrome = (syndrome: unknown) => {
  if (!(typeof syndrome === 'string') || !SYNDROMES.includes(syndrome)) {
    throw new Error(`Invalid syndrome ${syndrome} provided, must be one of ${SYNDROMES}`);
  }
};
