/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import { useMutation, useQueryClient } from 'react-query';
import { generatePath, useHistory, useParams } from 'react-router-dom';
import { post } from '../api';

export const useSubmitSurvey = () => {
  const params = useParams();
  const { push } = useHistory();
  const { surveyId, entityId } = params;

  return useMutation(
    formData => {
      const surveyResponse = {
        entityCode: entityId,
        surveyId,
        timestamp: new Date(),
        answers: formData,
      };
      console.log('submit form', surveyResponse);
      return post('surveyResponse', { body: surveyResponse });
    },
    {
      onSuccess: () => {
        console.log('success');
        const path = generatePath('/:projectId/:countryId/:entityId/:surveyId/success', params);
        push(path);
      },
    },
  );
};
