import { doesValueExist } from './doesValueExist';

export const doesIdExist = (collection, id) => doesValueExist(collection, 'id', id);
