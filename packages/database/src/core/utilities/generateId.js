/*
 * This module allows you to create and parse ObjectIDs without a reference to the mongodb or bson
 * modules.
 */

import ObjectID from 'bson-objectid';

/**
 * Generates a Mongo-style ObjectID as a hex string. The first four bytes are the number of seconds
 * since epoch. (Corollary: IDs are ordered by creation time.)
 */
export const generateId = () => {
  return ObjectID().toString();
};

export const getHighestPossibleIdForGivenTime = timestamp =>
  getSecondsStringFromTimestamp(timestamp).padEnd(24, 'f');

const getSecondsStringFromTimestamp = timestamp =>
  Math.floor(timestamp / 1000)
    .toString(16)
    .padStart(8, '0');
