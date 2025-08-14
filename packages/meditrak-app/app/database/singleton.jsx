import { api } from '../api';
import { DatabaseAccess } from './DatabaseAccess';

export const database = new DatabaseAccess(api);
