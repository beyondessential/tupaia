/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useQuery } from 'react-query';
import { get } from '../api';

export const useEntities = (projectCode?: string, entityCode?: string) => {
  return useQuery(`entities/${projectCode}/${entityCode}`, (): Promise<any> => get('entities'));
};
