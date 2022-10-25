/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import data from './data.json';

export const useSurvey = () => {
  console.log('data', data);
  return data;
};

// export const useSurvey = entityCode => {
//   return useQuery(['entity', entityCode], () => get(`entity/${entityCode}`), {
//     staleTime: 1000 * 60 * 60 * 1,
//     refetchOnWindowFocus: false,
//     retry: 2,
//   });
// };
