/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import { useMutation } from 'react-query';
import { post } from '../api';

export const useApproveSurveyResponse = () => {
  return useMutation(id => {
    return post(`approveSurveyResponse/${id}`);
  });
};
