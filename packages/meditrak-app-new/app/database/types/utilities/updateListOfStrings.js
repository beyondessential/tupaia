/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */
import { complement } from 'set-manipulator';

export const updateListOfStrings = (database, currentRealmStrings, newStrings, addString) => {
  const newRealmStrings = newStrings.map(newString => ({
    // Any strings that look like JSON will have been parsed into an object on interpreting the
    // HTTP result, so we need to return them to a string
    string: typeof newString === 'object' ? JSON.stringify(newString) : newString,
  }));
  const getRealmStringIdentifier = realmString => realmString.string;
  const toDelete = complement(currentRealmStrings, newRealmStrings, getRealmStringIdentifier);
  if (toDelete && toDelete.length > 0) database.delete('RealmString', toDelete);
  const toAdd = complement(newRealmStrings, currentRealmStrings, getRealmStringIdentifier);
  if (toAdd) {
    toAdd.forEach(realmStringToAdd => {
      addString(database.create('RealmString', realmStringToAdd));
    });
  }
};
