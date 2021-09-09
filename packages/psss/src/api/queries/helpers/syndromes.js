import { SYNDROMES } from '../../../constants';

export const EMPTY_SYNDROME_DATA = Object.keys(SYNDROMES).map(id => ({
  id,
  title: SYNDROMES[id],
  percentageChange: undefined,
  totalCases: null,
}));

export const getSyndromeData = reportRow =>
  Object.keys(SYNDROMES).map(id => ({
    id,
    title: SYNDROMES[id],
    percentageChange: reportRow[`${id} WoW Increase`],
    totalCases: reportRow[id],
    isAlert: reportRow[`${id} Threshold Crossed`],
  }));
