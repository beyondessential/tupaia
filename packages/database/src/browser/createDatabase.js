import { ModelRegistry } from '../core';
import { DatatrakDatabase } from './DatatrakDatabase';

export const createDatabase = async () => {
  const database = new DatatrakDatabase();
  const models = new ModelRegistry(database);

  return { models };
};
