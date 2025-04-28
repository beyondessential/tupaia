import ObjectID from 'bson-objectid';

export const generateId = () => {
  // This module allows you to create and parse ObjectIDs
  // without a reference to the mongodb or bson modules.
  const seconds = Math.floor(new Date() / 1000);

  // Constructs the ID based on the current time so that IDs are ordered by the time they're created
  return ObjectID(seconds).toString();
};

export const getHighestPossibleIdForGivenTime = timestamp =>
  getSecondsStringFromTimestamp(timestamp).padEnd(24, 'f');

const getSecondsStringFromTimestamp = timestamp =>
  Math.floor(timestamp / 1000)
    .toString(16)
    .padStart(8, '0');
