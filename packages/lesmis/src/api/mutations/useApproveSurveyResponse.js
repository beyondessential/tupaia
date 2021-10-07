/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import { useMutation } from 'react-query';
import { post } from '../api';

export const useApproveSurveyResponse = () => {
  return useMutation(
    data => {
      return post('approveSurveyResponse', {
        data,
      });
    },
    {
      onSuccess: () => {
        console.log('success');
      },
    },
  );
};
