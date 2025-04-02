import ObjectID from 'bson-objectid';

export const generateId = () => {
  // This module allows you to create and parse ObjectIDs 
  // without a reference to the mongodb or bson modules.
  return ObjectID().toString();
};

export const getHighestPossibleIdForGivenTime = timestamp =>
  getSecondsStringFromTimestamp(timestamp).padEnd(24, 'f');

const getSecondsStringFromTimestamp = timestamp =>
  Math.floor(timestamp / 1000)
    .toString(16)
    .padStart(8, '0');
