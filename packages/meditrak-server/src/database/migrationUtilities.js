/**
 * Tupaia Meditrak
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

export const rejectOnError = (resolve, reject, error) => {
  if (error) {
    console.error(error);
    reject(error);
  } else {
    resolve();
  }
};

export function insertObject(db, table, data) {
  const entries = Object.entries(data);
  const keys = entries.map(([k, v]) => k);
  const values = entries.map(([k, v]) => v);
  return new Promise((resolve, reject) => {
    return db.insert(table, keys, values, error => rejectOnError(resolve, reject, error));
  });
}

export function insertMultipleObjects(db, table, objects) {
  var chain = Promise.resolve();
  objects.map(o => {
    chain = chain.then(() => insertObject(db, table, o));
  });
  return chain;
}
