import { post } from '../api';

export const createExport = options => post('export', options);
