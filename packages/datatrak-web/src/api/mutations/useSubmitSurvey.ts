/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useMutation } from 'react-query';
import { Entity } from '@tupaia/types';
import { generatePath, useNavigate, useParams } from 'react-router-dom';
import { post } from '../api';
import { ROUTES } from '../../constants';

type FormSubmitProps = Record<string, any> & {
  entityId: Entity['id'];
  startTime: string;
};
export const useSubmitSurvey = () => {
  const navigate = useNavigate();
  const { surveyCode } = useParams();

  return useMutation(
    (formData: FormSubmitProps) => {
      console.log('formData', formData);
      const { entityId, startTime, ...answers } = formData;
      const surveyEntityId = entityId || 'world';
      const endTime = new Date().toISOString();
      const timestamp = new Date().toISOString();

      const surveyResponse = {
        entityId: surveyEntityId,
        surveyCode: surveyCode,
        answers,
        timestamp,
        endTime,
        startTime,
      };
      console.log('submit form', surveyResponse);
      return post('surveyResponse', { data: surveyResponse });
    },
    {
      onSuccess: () => {
        console.log('success');
        const path = generatePath(ROUTES.SURVEY_SUCCESS, { surveyCode });
        navigate(path);
      },
    },
  );
};
